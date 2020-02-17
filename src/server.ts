import 'reflect-metadata'
import 'dotenv/config'
import http from 'http'
import { ApolloServer } from 'apollo-server-express'
import express, { json } from 'express'
import { buildSchema } from 'type-graphql'
import resolvers from './resolvers'
import authChecker from './middlewares/authChecker'
import { mongoose } from '@typegoose/typegoose'
import helmet from 'helmet'
import enforce from 'express-sslify'
import Redis from "ioredis";
import { RedisPubSub } from "graphql-redis-subscriptions";
import setup from './utils/setup'
import { cyan, red, gray } from 'chalk'
import queryComplexityEvaluator from './utils/queryComplexityValidator/queryComplexity'
import Error from './middlewares/errorHandler'
import cors from 'cors'

// Context service
const contextService = require('request-context')

// Clear the console
// console.clear()

// Get the neccesary env variables
const { PORT, NODE_ENV, DB_USER, DB_PASS, DB_URI, ALLOWED_ORIGINS, REDIS_PORT, REDIS_URL } = process.env;

(async () => {
  try {
    // Create express app
    const app = express()

    // Get the left-most ip from the X-Forwarded-* header
    app.set('trust proxy', true)

    // Add context service middleware
    app.use(contextService.middleware('req'));

    // configure Redis connection options
    const options: Redis.RedisOptions = {
      host: REDIS_URL,
      port: Number(REDIS_PORT),
      retryStrategy: (times: any) => Math.max(times * 100, 3000),
    };

    // create Redis-based pub-sub
    const pubSub = new RedisPubSub({
      publisher: new Redis(options),
      subscriber: new Redis(options),
    });

    // Create Schema
    const schema = await buildSchema({
      resolvers,
      authChecker,
      pubSub
    })

    // Create production basic security
    if (NODE_ENV === 'production') {
      app.use(json({ limit: '2mb' }))
      app.use(enforce.HTTPS({ trustProtoHeader: true }))
      app.use(helmet())
      app.disable('x-powered-by')
      app.use(cors({ origin: (origin, callback) => {
        if (JSON.parse(ALLOWED_ORIGINS!).includes(origin!)) {
          callback(null, true)
        }
        throw new Error('The origin is not allowed', 500)
      } }))
    }

    // Create database connection
    await mongoose.connect(`mongodb+srv://${DB_USER}:${DB_PASS}${DB_URI}`, {
      useNewUrlParser: true,
      dbName: 'forge',
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false
    })

    // Once connection was stablished procced to run the setup
    await setup()

    // Create apollo server once setup has completed
    const server = new ApolloServer({
      context: ({ req, res }) => {
        return { req, res }
      },
      playground: NODE_ENV !== 'production',
      schema,
      debug: false,
      plugins: [{
        requestDidStart: () => ({
          didResolveOperation({ request, document }) {
            queryComplexityEvaluator(request, document, schema)
          }
        })
      }],
      formatError: (err) => {
        const message = err.message.toLowerCase()
        if (message.includes('argument validation error')) {
          const error = err.extensions!.exception.validationErrors.map((u: any) => u.constraints)
          err.message = error.map((u : any) => Object.values(u))
          err.extensions!.code = 'BAD_REQUEST'
        } else if (message.includes('invalid signature') || message.includes('invalid token')) {
          err.message = 'Invalid request'
          err.extensions!.code = 'BAD_REQUEST'
        }

        console.log(red(err.message), gray(err.extensions?.code))
        return err
      },
      subscriptions: {
        path: "/subscriptions"
      }
    })

    // Create middleware
    server.applyMiddleware({ app })

    // Install subscription handler
    const httpServer = http.createServer(app)
    server.installSubscriptionHandlers(httpServer)

    // listen to port
    httpServer.listen(PORT, () => {
      console.log(cyan(`Server running on http://localhost:${PORT}${server.graphqlPath}`))
      console.log(cyan(`WSS running on wss://localhost:${PORT}${server.subscriptionsPath}`))
    })
  } catch ({ message, code }) {
    console.log(red(message))
    throw new Error(message, code)
  }
})()

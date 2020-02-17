import { Resolver, Mutation, Args, Subscription, Root, PubSub, PubSubEngine } from "type-graphql";
import { Lead, leadModel } from "../../models/lead";
import createLeadInterface from "./interfaces/createLeadInterface";
import EmailProvider from "../../utils/emailProvider";
import { createFilters } from "../../utils/reusableSnippets";
import createCRUDResolver from "../globalResolvers/crudBaseResolver";
import CheckSEOInterface from "./interfaces/checkSEOInterface";
import seoChecker from "../../utils/reusableSnippets/seoChecker";
import SEOResult from "./outputTypes/seoResultOutput";
import seoResultTypeInterface from "./interfaces/seoResultInputType";

// Define the prefix of the resolvers
const resolverName = 'Lead'

// Create an enum based on the model indexes
const { textIndexes, regularIndexes } = createFilters(leadModel, resolverName)

// Initialize base CRUD factory
const CRUDLead = createCRUDResolver({
  prefix: resolverName,
  returnType: Lead,
  model: leadModel,
  allowedSearchCriterias: textIndexes,
  allowedSortCriterias: regularIndexes,
  permissions: {
    findById: [`read_all_${resolverName}s`],
    readAll: [`read_all_${resolverName}s`],
    deleteById: [`delete_all_${resolverName}s`]
  }
})

@Resolver(() => Lead)
export default class LeadResolvers extends CRUDLead {
  @Mutation(() => Lead)
  async createLead (
    @Args() { phoneNumber, name, email }: createLeadInterface
  ): Promise<Lead> {
    // Create the lead
    const lead = await leadModel.create({
      email,
      phoneNumber,
      name
    })

    // Email the lead
    const emailTransporter = new EmailProvider({
      subject: 'New Lead',
      to: JSON.parse(process.env.LEAD_RECIPIENTS!),
      data: lead,
      template: 'new_lead'
    })

    // Send the email
    await emailTransporter.sendEmail()

    // return the lead
    return lead
  }

  @Mutation(() => String)
  async checkSEO (
    @Args() { url, phoneNumber, email, name }: CheckSEOInterface,
    @PubSub() pubSub: PubSubEngine
  ): Promise<string> {
    // Create seo bot
    const bot = new seoChecker({ url })

    // check seo
    bot.checkSEO().then((results) => {
      pubSub.publish('SEO_NOTIFICATION', { ...results, email })
    })

    // Create the lead
    const lead = await leadModel.create({
      email,
      phoneNumber,
      name
    })

    // Email the lead
    const emailTransporter = new EmailProvider({
      subject: 'New Lead',
      to: JSON.parse(process.env.LEAD_RECIPIENTS!),
      data: lead,
      template: 'new_lead'
    })

    // Send the email
    await emailTransporter.sendEmail()

    return email
  }

  @Subscription(() => SEOResult, {
    topics: ['SEO_NOTIFICATION'],
    filter: ({ args, payload }) => args.email === payload.email
  })
  getSEOReport(
    @Args() { email }: seoResultTypeInterface,
    @Root() root: any
  ) {
    console.log(email)
    return root
  }

}
import { ObjectType, Field } from "type-graphql";

@ObjectType()
class headers {
  @Field(() => [String])
  h1: string[]
  @Field(() => [String])
  h2: string[]
  @Field(() => [String])
  h3: string[]
  @Field(() => [String])
  h4: string[]
  @Field(() => [String])
  h5: string[]
  @Field(() => [String])
  h6: string[]
}

@ObjectType()
class performance {
  @Field()
  score: number
}

@ObjectType()
class accessibility extends performance {
}

@ObjectType()
class seo extends performance {
}

@ObjectType()
class scores {
  @Field()
  performance: performance
  @Field()
  accessibility: accessibility
  @Field()
  seo: seo
}

@ObjectType()
export default class SEOResult {
  @Field()
  url: string

  @Field()
  title: string

  @Field(() => headers)
  headers:headers
  
  @Field()
  description: string
  
  @Field()
  isMobileFriendly: string

  @Field()
  scores: scores
}
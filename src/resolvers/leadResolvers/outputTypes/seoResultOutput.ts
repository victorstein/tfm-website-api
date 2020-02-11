import { ObjectType, Field } from "type-graphql";
import { intOrStringScalar } from "../../../utils/reusableSnippets/customScalars";

@ObjectType()
class test {
  @Field()
  title: string
  @Field()
  description: string
  @Field(() => intOrStringScalar, { nullable: true })
  score: string | number | null
}

@ObjectType()
export default class SEOResult {
  @Field()
  score: number
  @Field(() => [test], { nullable: true })
  passed: test[]
  @Field(() => [test], { nullable: true })
  failed: test[]
}
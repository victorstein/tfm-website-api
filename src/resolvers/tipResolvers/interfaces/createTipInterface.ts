import { ArgsType, Field, registerEnumType } from "type-graphql";

enum departments {
  SEO = 'seo',
  PPC = 'ppc'
}

registerEnumType(departments, { name: 'departments' })

@ArgsType()
export default class createTipInteface {
  @Field({ nullable: false })
  title: string

  @Field({ nullable: false })
  description: string

  @Field(() => departments, { nullable: false })
  department: departments
}
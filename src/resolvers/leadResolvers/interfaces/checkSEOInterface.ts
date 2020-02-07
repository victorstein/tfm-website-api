import { ArgsType, Field } from "type-graphql";
import createLeadInterface from "./createLeadInterface";

@ArgsType()
export default class CheckSEOInterface extends createLeadInterface {
  @Field({ nullable: false })
  url: string
}
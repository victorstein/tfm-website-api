import { ObjectType, Field } from "type-graphql";
import { plugin, modelOptions, prop, getModelForClass } from "@typegoose/typegoose";
import pagination from "../utils/reusableSnippets/pagination";
import { Base } from "./base";

@ObjectType()
@plugin(pagination)
@modelOptions({ schemaOptions: { timestamps: true } })
export class Lead extends Base {
  @prop({ required: false })
  @Field({ nullable: true })
  name: string

  @prop({ required: false })
  @Field({ nullable: true })
  phoneNumber: string

  @prop({ required: true })
  @Field({ nullable: false })
  email: string
}

export const leadModel = getModelForClass(Lead)
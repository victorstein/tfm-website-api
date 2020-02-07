import { ObjectType, Field } from "type-graphql";
import { Base } from "./base";
import { prop, modelOptions, plugin, getModelForClass } from "@typegoose/typegoose";
import pagination from "../utils/reusableSnippets/pagination";

@modelOptions({ schemaOptions: { timestamps: true } })
@plugin(pagination)
@ObjectType()
export class Tip extends Base {
  @prop({ required: true })
  @Field({ nullable: false })
  description: string

  @prop({ required: true })
  @Field({ nullable: false })
  title: string
  
  @prop({ required: true })
  @Field({ nullable: false })
  department: string
}

export const tipModel = getModelForClass(Tip)
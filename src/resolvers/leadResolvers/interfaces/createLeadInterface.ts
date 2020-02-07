import { ArgsType, Field } from "type-graphql";
import { IsEmail, IsPhoneNumber } from "class-validator";
import { isNewLead } from "../../../utils/customValidators/validators";

@ArgsType()
export default class createLeadInterface {
  @Field({ nullable: true })
  name: string

  @Field({ nullable: true })
  @IsPhoneNumber('US', { message: 'The provided phone number is invalid' })
  phoneNumber: string

  @Field({ nullable: false })
  @IsEmail(undefined, { message: 'The email provided is not valid' })
  @isNewLead({ message: 'We have already assesed your website, call us today for a free another free assesment.' })
  email: string
}
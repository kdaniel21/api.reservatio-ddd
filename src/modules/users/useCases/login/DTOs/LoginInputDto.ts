import { IsEmail } from 'class-validator'
import { ArgsType, Field } from 'type-graphql'

@ArgsType()
export default class LoginInputDto {
  @IsEmail()
  @Field()
  email: string

  @Field()
  password: string
}

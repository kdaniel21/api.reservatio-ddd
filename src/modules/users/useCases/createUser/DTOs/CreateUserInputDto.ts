import { IsEmail } from 'class-validator'
import { Field, InputType } from 'type-graphql'

@InputType()
export default class CreateUserInputDto {
  @Field()
  name: string

  @IsEmail()
  @Field()
  email: string

  @Field()
  password: string
}

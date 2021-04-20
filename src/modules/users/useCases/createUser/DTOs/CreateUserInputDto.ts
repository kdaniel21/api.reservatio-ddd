import { IsEmail, MinLength } from 'class-validator'
import { Field, InputType } from 'type-graphql'

@InputType()
export default class CreateUserInputDto {
  @Field()
  name: string

  @IsEmail()
  @Field()
  email: string

  // TODO: Create constant for password length
  @MinLength(8)
  @Field()
  password: string

  // TODO: Add sameAs validator
  @MinLength(8)
  @Field()
  passwordConfirm: string
}

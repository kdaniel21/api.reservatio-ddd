import { MinLength } from 'class-validator'
import { Field, InputType } from 'type-graphql'

@InputType()
export default class ChangePasswordUsingTokenInputDto {
  @Field()
  passwordResetToken: string

  @MinLength(8)
  @Field()
  password: string

  // TODO: Create sameAs validator
  @MinLength(8)
  @Field()
  passwordConfirm: string
}

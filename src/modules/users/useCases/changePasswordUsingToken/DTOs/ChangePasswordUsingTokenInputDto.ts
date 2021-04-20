import { Field, InputType } from 'type-graphql'

@InputType()
export default class ChangePasswordUsingTokenInputDto {
  @Field()
  passwordResetToken: string

  @Field()
  password: string

  @Field()
  passwordConfirm: string
}

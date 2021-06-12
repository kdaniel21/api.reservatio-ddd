import { Field, InputType } from 'type-graphql'

@InputType()
export default class RegisterInputDto {
  @Field()
  email: string

  @Field()
  name: string

  @Field()
  password: string

  @Field()
  passwordConfirm: string

  @Field()
  invitationToken: string
}

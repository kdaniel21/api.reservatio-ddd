import { Field, InputType } from 'type-graphql'

@InputType()
export default class RefreshAccessTokenInputDto {
  @Field({ nullable: true })
  refreshToken?: string

  @Field({ nullable: true })
  accessToken?: string
}

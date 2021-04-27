import { ArgsType, Field } from 'type-graphql'

@ArgsType()
export default class RefreshAccessTokenInputDto {
  @Field({ nullable: true })
  refreshToken?: string
}

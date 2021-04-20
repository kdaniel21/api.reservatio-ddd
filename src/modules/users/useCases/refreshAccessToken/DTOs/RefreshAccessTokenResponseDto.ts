import { JwtToken } from '@modules/users/domain/AccessToken'
import { Field, ObjectType } from 'type-graphql'

@ObjectType()
export default class RefreshAccessTokenResponseDto {
  @Field()
  accessToken: JwtToken
}

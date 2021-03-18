import GraphQLUser from '@modules/users/infra/http/TypeGraphQL/types/GraphQLUser'
import { Field, ObjectType } from 'type-graphql'

@ObjectType({ description: 'Login mutation result.' })
export default class LoginResponseDto {
  @Field()
  user: GraphQLUser

  @Field()
  accessToken: string

  @Field()
  refreshToken: string
}

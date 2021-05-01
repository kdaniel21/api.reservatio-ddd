import GraphQLUser from '@modules/users/infra/http/GraphQL/types/GraphQLUser'
import { Field, ObjectType } from 'type-graphql'

@ObjectType()
export default class CreateUserResponseDto {
  @Field(() => GraphQLUser)
  user: GraphQLUser
}

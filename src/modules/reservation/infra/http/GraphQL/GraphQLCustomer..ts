import CustomerDto from '@modules/reservation/DTOs/CustomerDto'
import GraphQLUser from '@modules/users/infra/http/GraphQL/types/GraphQLUser'
import { Field, ID, ObjectType } from 'type-graphql'

@ObjectType()
export default class GraphQLCustomer implements CustomerDto {
  @Field(() => ID)
  id: string

  @Field(() => GraphQLUser)
  user?: GraphQLUser

  userId: string

  @Field()
  name: string
}

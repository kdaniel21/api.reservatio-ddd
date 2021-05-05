import CustomerRole from '@modules/reservation/domain/CustomerRole'
import CustomerDto from '@modules/reservation/DTOs/CustomerDto'
import GraphQLUser from '@modules/users/infra/http/GraphQL/GraphQLUser'
import { Field, ID, ObjectType, registerEnumType } from 'type-graphql'

registerEnumType(CustomerRole, { name: 'Role' })

@ObjectType()
export default class GraphQLCustomer implements CustomerDto {
  @Field(() => ID)
  id: string

  @Field(() => GraphQLUser)
  user?: GraphQLUser

  userId: string

  @Field()
  name: string

  @Field(() => CustomerRole)
  role: CustomerRole
}

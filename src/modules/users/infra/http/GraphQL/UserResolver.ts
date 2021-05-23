import GraphQLCustomer from '@modules/reservation/infra/http/GraphQL/GraphQLCustomer.'
import CustomerMapper from '@modules/reservation/mappers/CustomerMapper'
import CustomerRepository from '@modules/reservation/repositories/CustomerRepository/CustomerRepository'
import UniqueID from '@shared/domain/UniqueID'
import { FieldResolver, Resolver, Root } from 'type-graphql'
import GraphQLUser from './GraphQLUser'

@Resolver(() => GraphQLUser)
export default class UserResolver {
  constructor(private customerRepo: CustomerRepository) {}
  @FieldResolver(() => GraphQLCustomer)
  async customer(@Root() user: GraphQLUser): Promise<GraphQLCustomer> {
    const userId = new UniqueID(user.id)
    const customerOrError = await this.customerRepo.findByUserId(userId)
    if (customerOrError.isFailure()) throw customerOrError.error
    return CustomerMapper.toDto(customerOrError.value)
  }
}

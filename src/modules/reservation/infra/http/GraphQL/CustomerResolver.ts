import GraphQLUser from '@modules/users/infra/http/GraphQL/GraphQLUser'
import UserMapper from '@modules/users/mappers/UserMapper'
import UserRepository from '@modules/users/repositories/UserRepository'
import UniqueID from '@shared/domain/UniqueID'
import { FieldResolver, Resolver, Root } from 'type-graphql'
import GraphQLCustomer from './GraphQLCustomer.'

@Resolver(() => GraphQLCustomer)
export default class CustomerResolver {
  constructor(private userRepo: UserRepository) {}

  @FieldResolver(() => GraphQLUser)
  async user(@Root() customer: GraphQLCustomer): Promise<GraphQLUser> {
    const userOrError = await this.userRepo.findById(new UniqueID(customer.userId))
    if (userOrError.isFailure()) throw userOrError.error

    return UserMapper.toDto(userOrError.value)
  }
}

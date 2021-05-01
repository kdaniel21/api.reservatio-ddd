import GraphQLUser from '@modules/users/infra/http/GraphQL/types/GraphQLUser'
import UserMapper from '@modules/users/mappers/UserMapper'
import ApolloContext from '@shared/infra/http/apollo/types/ApolloContext'
import { Authorized, Ctx, Query, Resolver } from 'type-graphql'
import GetCurrentUserUseCase from './GetCurrentUserUseCase'

@Resolver()
export default class GetCurrentUserResolver {
  constructor(private useCase: GetCurrentUserUseCase) {}

  @Authorized()
  @Query(() => GraphQLUser)
  async currentUser(@Ctx() context: ApolloContext): Promise<GraphQLUser> {
    const result = await this.useCase.execute(context.user)

    if (result.isFailure()) throw result.error

    return UserMapper.toDto(result.value.user)
  }
}

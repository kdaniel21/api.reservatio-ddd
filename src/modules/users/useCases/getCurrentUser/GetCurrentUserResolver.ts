import GraphQLUser from '@modules/users/infra/http/TypeGraphQL/types/GraphQLUser'
import UserMapper from '@modules/users/mappers/UserMapper'
import UserRepository from '@modules/users/repositories/UserRepository'
import ApolloContext from '@shared/infra/http/apollo/types/ApolloContext'
import { Authorized, Ctx, Query, Resolver } from 'type-graphql'

@Resolver()
export default class GetCurrentUserResolver {
  constructor(private userRepository: UserRepository) {}

  @Authorized()
  @Query(() => GraphQLUser)
  async currentUser(@Ctx() context: ApolloContext): Promise<GraphQLUser> {
    const { user: userPayload } = context

    const user = await this.userRepository.findByEmail(userPayload.email)

    return UserMapper.toDto(user)
  }
}

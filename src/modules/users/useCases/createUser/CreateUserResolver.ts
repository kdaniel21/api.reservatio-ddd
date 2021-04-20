import GraphQLUser from '@modules/users/infra/http/TypeGraphQL/types/GraphQLUser'
import UserMapper from '@modules/users/mappers/UserMapper'
import { ApolloError } from 'apollo-server'
import { Arg, Mutation, Resolver } from 'type-graphql'
import CreateUserUseCase from './CreateUserUseCase'
import CreateUserDto from './DTOs/CreateUserDto'
import CreateUserInputDto from './DTOs/CreateUserInputDto'
import CreateUserResponseDto from './DTOs/CreateUserResponseDto'

@Resolver()
export default class CreateUserResolver {
  constructor(private useCase: CreateUserUseCase) {}

  @Mutation(() => CreateUserResponseDto)
  async createUser(@Arg('params') params: CreateUserInputDto) {
    const request: CreateUserDto = { ...params }

    const result = await this.useCase.execute(request)

    if (result.isSuccess()) {
      const userDto = UserMapper.toDto(result.value.user)
      return { user: userDto }
    }

    throw new ApolloError(result.error.error.message)
  }
}

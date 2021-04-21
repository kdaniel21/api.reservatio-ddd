import GraphQLUser from '@modules/users/infra/http/TypeGraphQL/types/GraphQLUser'
import UserMapper from '@modules/users/mappers/UserMapper'
import { Arg, Mutation, Resolver } from 'type-graphql'
import CreateUserUseCase from './CreateUserUseCase'
import CreateUserUseCaseDto from './DTOs/CreateUserUseCaseDto'
import CreateUserInputDto from './DTOs/CreateUserInputDto'
import CreateUserResponseDto from './DTOs/CreateUserResponseDto'

@Resolver()
export default class CreateUserResolver {
  constructor(private useCase: CreateUserUseCase) {}

  /*@Mutation(() => CreateUserResponseDto)
  async createUser(@Arg('params') params: CreateUserInputDto) {
    const request: CreateUserUseCaseDto = { ...params }

    const result = await this.useCase.execute(request)

    if (result.isFailure()) throw result.error

    const userDto: GraphQLUser = UserMapper.toDto(result.value.user)
    return { user: userDto }
  }*/
}

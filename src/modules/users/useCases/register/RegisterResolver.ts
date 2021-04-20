import RefreshTokenMapper from '@modules/users/mappers/RefreshTokenMapper'
import UserMapper from '@modules/users/mappers/UserMapper'
import { Arg, Mutation, Resolver } from 'type-graphql'
import RegisterInputDto from './DTOs/RegisterInputDto'
import RegisterResponseDto from './DTOs/RegisterResponseDto'
import RegisterUseCase from './RegisterUseCase'

@Resolver()
export default class RegisterResolver {
  constructor(private useCase: RegisterUseCase) {}

  @Mutation(() => RegisterResponseDto)
  async register(@Arg('params') params: RegisterInputDto): Promise<RegisterResponseDto> {
    const result = await this.useCase.execute(params)

    if (result.isFailure()) {
      throw result.error
    }

    const { user, refreshToken, accessToken } = result.value
    const resultDto: RegisterResponseDto = {
      user: UserMapper.toDto(user),
      refreshToken: RefreshTokenMapper.toDto(refreshToken),
      accessToken,
    }

    return resultDto
  }
}

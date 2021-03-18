import RefreshTokenMapper from '@modules/users/mappers/RefreshTokenMapper'
import UserMapper from '@modules/users/mappers/UserMapper'
import { Arg, Mutation, Resolver } from 'type-graphql'
import LoginDto from './DTOs/LoginUseCaseDto'
import LoginInputDto from './DTOs/LoginInputDto'
import LoginResponseDto from './DTOs/LoginResponseDto'
import LoginUseCase from './LoginUseCase'

@Resolver()
export default class LoginResolver {
  constructor(private useCase: LoginUseCase) {}

  @Mutation(() => LoginResponseDto)
  async login(@Arg('params') params: LoginInputDto): Promise<LoginResponseDto> {
    const loginDto: LoginDto = params

    const result = await this.useCase.execute(loginDto)

    if (result.isFailure()) {
      throw result.error
    }

    const resultDto: LoginResponseDto = {
      accessToken: result.value.accessToken,
      refreshToken: RefreshTokenMapper.toDto(result.value.refreshToken),
      user: UserMapper.toDto(result.value.user),
    }

    return resultDto
  }
}

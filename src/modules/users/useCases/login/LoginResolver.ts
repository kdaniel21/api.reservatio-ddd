import RefreshTokenMapper from '@modules/users/mappers/RefreshTokenMapper'
import UserMapper from '@modules/users/mappers/UserMapper'
import { Args, Ctx, Mutation, Resolver } from 'type-graphql'
import LoginDto from './DTOs/LoginUseCaseDto'
import LoginInputDto from './DTOs/LoginInputDto'
import LoginResponseDto from './DTOs/LoginResponseDto'
import LoginUseCase from './LoginUseCase'
import ApolloContext from '@shared/infra/http/apollo/types/ApolloContext'
import config from '@config'

@Resolver()
export default class LoginResolver {
  constructor(private useCase: LoginUseCase) {}

  @Mutation(() => LoginResponseDto)
  async login(@Args() params: LoginInputDto, @Ctx() { cookies }: ApolloContext): Promise<LoginResponseDto> {
    const loginDto: LoginDto = params

    const result = await this.useCase.execute(loginDto)

    if (result.isFailure()) throw result.error

    const resultDto: LoginResponseDto = {
      accessToken: result.value.accessToken,
      refreshToken: RefreshTokenMapper.toDto(result.value.refreshToken),
      user: UserMapper.toDto(result.value.user),
    }

    const cookieExpirationTime = new Date(Date.now() + config.auth.refreshTokenExpirationHours * 60 * 60 * 1000)
    cookies.set(config.auth.refreshTokenCookieName, resultDto.refreshToken, {
      httpOnly: true,
      secure: config.isProduction,
      expires: cookieExpirationTime,
    })

    return resultDto
  }
}

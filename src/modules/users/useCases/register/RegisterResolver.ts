import config from '@config'
import RefreshTokenMapper from '@modules/users/mappers/RefreshTokenMapper'
import UserMapper from '@modules/users/mappers/UserMapper'
import ApolloContext from '@shared/infra/http/apollo/types/ApolloContext'
import { ApolloError } from 'apollo-server-errors'
import { Arg, Ctx, Mutation, Resolver } from 'type-graphql'
import RegisterInputDto from './DTOs/RegisterInputDto'
import RegisterResponseDto from './DTOs/RegisterResponseDto'
import RegisterUseCase from './RegisterUseCase'

@Resolver()
export default class RegisterResolver {
  constructor(private useCase: RegisterUseCase) {}

  @Mutation(() => RegisterResponseDto)
  async register(
    @Arg('params') params: RegisterInputDto,
    @Ctx() { cookies }: ApolloContext
  ): Promise<RegisterResponseDto> {
    if (params.password !== params.passwordConfirm)
      throw new ApolloError('The passwords must match!', 'VALIDATION_ERROR')

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

    const cookieExpirationTime = new Date(Date.now() + config.auth.refreshTokenExpirationHours * 60 * 60 * 1000)
    cookies.set(config.auth.refreshTokenCookieName, resultDto.refreshToken, {
      httpOnly: true,
      secure: config.isProduction,
      expires: cookieExpirationTime,
    })

    return resultDto
  }
}

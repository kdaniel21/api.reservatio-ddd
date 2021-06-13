import { Guard } from '@shared/core/Guard'
import ApolloContext from '@shared/infra/http/apollo/types/ApolloContext'
import { Arg, Args, Ctx, Mutation, Query, Resolver } from 'type-graphql'
import RefreshAccessTokenInputDto from './DTOs/RefreshAccessTokenInputDto'
import RefreshAccessTokenResponseDto from './DTOs/RefreshAccessTokenResponseDto'
import RefreshAccessTokenUseCase from './RefreshAccessTokenUseCase'
import config from '@config'
import { RefreshAccessTokenErrors } from './RefreshAccessTokenErrors'

@Resolver()
export default class RefreshAccessTokenResolver {
  constructor(private useCase: RefreshAccessTokenUseCase) {}

  @Query(() => RefreshAccessTokenResponseDto)
  async refreshAccessToken(
    @Ctx() { cookies }: ApolloContext,
    @Args() params?: RefreshAccessTokenInputDto,
  ): Promise<RefreshAccessTokenResponseDto> {
    const refreshToken = params?.refreshToken || cookies.get(config.auth.refreshTokenCookieName)
    const guardResult = Guard.againstNullOrUndefined({
      argument: refreshToken,
      argumentName: 'refresh token',
    })
    if (!guardResult.isSuccess) throw new RefreshAccessTokenErrors.InvalidRefreshTokenError()

    const result = await this.useCase.execute({ refreshToken })

    if (result.isFailure()) throw result.error

    return { accessToken: result.value.accessToken }
  }
}

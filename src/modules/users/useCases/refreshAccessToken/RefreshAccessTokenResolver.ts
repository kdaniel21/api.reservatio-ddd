import { Guard } from '@shared/core/Guard'
import ApolloContext from '@shared/infra/http/apollo/types/ApolloContext'
import { ApolloError } from 'apollo-server-errors'
import { Arg, Ctx, Mutation, Resolver } from 'type-graphql'
import RefreshAccessTokenUseCaseDto from './DTOs/RefreshAccessTokenUseCaseDto'
import RefreshAccessTokenInputDto from './DTOs/RefreshAccessTokenInputDto'
import RefreshAccessTokenResponseDto from './DTOs/RefreshAccessTokenResponseDto'
import RefreshAccessTokenUseCase from './RefreshAccessTokenUseCase'

@Resolver()
export default class RefreshAccessTokenResolver {
  constructor(private useCase: RefreshAccessTokenUseCase) {}

  @Mutation(() => RefreshAccessTokenResponseDto)
  async refreshAccessToken(
    @Arg('params') params: RefreshAccessTokenInputDto,
    @Ctx() { req }: ApolloContext
  ): Promise<RefreshAccessTokenResponseDto> {
    const refreshToken = params.refreshToken || req.cookies.refreshToken
    const guardResult = Guard.againstNullOrUndefined({
      argument: refreshToken,
      argumentName: 'refresh token',
    })
    if (!guardResult.isSuccess) throw new ApolloError(guardResult.message)

    const { accessToken } = params
    const requestDto: RefreshAccessTokenUseCaseDto = {
      refreshToken,
      accessToken,
    }

    const result = await this.useCase.execute(requestDto)

    if (result.isFailure()) {
      throw result.error
    }

    return { accessToken: result.value.accessToken }
  }
}
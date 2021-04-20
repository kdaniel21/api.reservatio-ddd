import ApolloContext from '@shared/infra/http/apollo/types/ApolloContext'
import MessageResponseDto from '@shared/infra/http/apollo/types/MessageResponseDto'
import { ApolloError } from 'apollo-server'
import { Arg, Ctx, Mutation, Resolver } from 'type-graphql'
import LogoutDto from './DTOs/LogoutDto'
import { LogoutErrors } from './LogoutErrors'
import LogoutUseCase from './LogoutUseCase'

@Resolver()
export default class LogoutResolver {
  constructor(private useCase: LogoutUseCase) {}

  @Mutation(() => MessageResponseDto)
  // TODO: Maybe separate class for validation?
  async logout(
    @Ctx() { req, user }: ApolloContext,
    @Arg('refreshToken') refreshTokenInput?: string
  ): Promise<MessageResponseDto> {
    const refreshToken = refreshTokenInput || req.cookies.get('refreshToken')
    if (!refreshToken) throw new LogoutErrors.InvalidRefreshTokenError()

    const requestDto: LogoutDto = {
      token: refreshToken,
      user,
    }
    const result = await this.useCase.execute(requestDto)

    if (result.isSuccess()) {
      return { message: 'You have been logged out' }
    }

    throw new ApolloError(result.error.error.message)
  }
}

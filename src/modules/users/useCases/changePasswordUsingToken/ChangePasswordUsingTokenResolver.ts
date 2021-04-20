import MessageResponseDto from '@shared/infra/http/apollo/types/MessageResponseDto'
import { ApolloError } from 'apollo-server'
import { Arg, Mutation, Resolver } from 'type-graphql'
import ChangePasswordUsingTokenUseCase from './ChangePasswordUsingTokenUseCase'
import ChangePasswordUsingTokenUseCaseDto from './DTOs/ChangePasswordUsingTokenUseCaseDto'
import ChangePasswordUsingTokenInputDto from './DTOs/ChangePasswordUsingTokenInputDto'

@Resolver()
export default class ChangePasswordUsingResolver {
  constructor(private useCase: ChangePasswordUsingTokenUseCase) {}

  @Mutation(() => MessageResponseDto)
  async changePasswordUsingToken(
    @Arg('params') params: ChangePasswordUsingTokenInputDto
  ): Promise<MessageResponseDto> {
    const request: ChangePasswordUsingTokenUseCaseDto = {
      passwordResetToken: params.passwordResetToken,
      newPassword: params.password,
    }

    const result = await this.useCase.execute(request)

    if (result.isSuccess()) {
      return { message: 'Password has been changed successfully!' }
    }

    throw new ApolloError(result.error.error.message)
  }
}

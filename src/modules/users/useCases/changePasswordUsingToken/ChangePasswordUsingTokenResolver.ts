import MessageResponseDto from '@shared/infra/http/apollo/types/MessageResponseDto'
import { Arg, Mutation, Resolver } from 'type-graphql'
import ChangePasswordUsingTokenUseCase from './ChangePasswordUsingTokenUseCase'
import ChangePasswordUsingTokenUseCaseDto from './DTOs/ChangePasswordUsingTokenUseCaseDto'
import ChangePasswordUsingTokenInputDto from './DTOs/ChangePasswordUsingTokenInputDto'
import { ApolloError } from 'apollo-server-koa'

@Resolver()
export default class ChangePasswordUsingTokenResolver {
  constructor(private useCase: ChangePasswordUsingTokenUseCase) {}

  @Mutation(() => MessageResponseDto)
  async changePasswordUsingToken(@Arg('params') params: ChangePasswordUsingTokenInputDto): Promise<MessageResponseDto> {
    if (params.password !== params.passwordConfirm)
      throw new ApolloError('The passwords must match!', 'VALIDATION_ERROR')

    const request: ChangePasswordUsingTokenUseCaseDto = {
      passwordResetToken: params.passwordResetToken,
      newPassword: params.password,
    }

    const result = await this.useCase.execute(request)

    if (result.isSuccess()) {
      return { message: 'Password has been changed successfully!' }
    }

    throw result.error
  }
}

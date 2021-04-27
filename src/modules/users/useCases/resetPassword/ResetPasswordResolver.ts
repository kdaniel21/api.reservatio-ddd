import MessageResponseDto from '@shared/infra/http/apollo/types/MessageResponseDto'
import { Arg, Mutation, Resolver } from 'type-graphql'
import ResetPasswordUseCase from './ResetPasswordUseCase'

@Resolver()
export default class ResetPasswordResolver {
  constructor(private useCase: ResetPasswordUseCase) {}

  @Mutation(() => MessageResponseDto)
  async resetPassword(@Arg('email') email: string) {
    const result = await this.useCase.execute({ email })

    if (result.isFailure()) throw result.error

    return {
      message:
        'A password reset email has been sent to the email address if it is registered.',
    }
  }
}

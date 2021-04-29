import MessageResponseDto from '@shared/infra/http/apollo/types/MessageResponseDto'
import { Arg, Mutation, Resolver } from 'type-graphql'
import ConfirmEmailUseCase from './ConfirmEmailUseCase'

@Resolver()
export default class ConfirmEmailResolver {
  constructor(private useCase: ConfirmEmailUseCase) {}

  @Mutation(() => MessageResponseDto)
  async confirmEmail(@Arg('token') emailConfirmationToken: string): Promise<MessageResponseDto> {
    const result = await this.useCase.execute({ emailConfirmationToken })

    if (result.isFailure()) throw result.error

    return { message: 'Your email address has been confirmed! Now you can log in.' }
  }
}

import MessageResponseDto from '@shared/infra/http/apollo/types/MessageResponseDto'
import { Arg, Mutation, Resolver } from 'type-graphql'
import SendEmailConfirmationUseCase from './SendEmailConfirmationUseCase'

@Resolver()
export default class SendEmailConfirmationResolver {
  constructor(private useCase: SendEmailConfirmationUseCase) {}

  @Mutation(() => MessageResponseDto)
  async sendEmailConfirmation(@Arg('email') email: string): Promise<MessageResponseDto> {
    const result = await this.useCase.execute({ email })

    if (result.isFailure()) throw result.error

    return { message: 'Confirmation email has been successfully sent!' }
  }
}

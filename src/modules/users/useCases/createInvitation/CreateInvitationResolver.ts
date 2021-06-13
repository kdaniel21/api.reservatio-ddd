import ApolloContext from '@shared/infra/http/apollo/types/ApolloContext'
import MessageResponseDto from '@shared/infra/http/apollo/types/MessageResponseDto'
import { Arg, Authorized, Ctx, Mutation, Resolver } from 'type-graphql'
import CreateInvitationUseCase from './CreateInvitationUseCase'

@Resolver()
export default class CreateInvitationResolver {
  constructor(private readonly useCase: CreateInvitationUseCase) {}

  @Authorized()
  @Mutation(() => MessageResponseDto)
  async sendInvitation(
    @Arg('email') emailAddress: string,
    @Ctx() { user }: ApolloContext,
  ): Promise<MessageResponseDto> {
    const result = await this.useCase.execute({ emailAddress, redactedUser: user })
    if (result.isFailure()) throw result.error

    return {
      message: `Invitation has been sent successfully to ${emailAddress}`,
    }
  }
}

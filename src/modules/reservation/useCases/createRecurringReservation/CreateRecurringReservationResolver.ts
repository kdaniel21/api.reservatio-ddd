import ApolloContext from '@shared/infra/http/apollo/types/ApolloContext'
import { Args, Authorized, Ctx, Mutation, Resolver } from 'type-graphql'
import CreateRecurringReservationUseCase from './CreateRecurringReservationUseCase'
import CreateRecurringReservationArgs from './DTOs/CreateRecurringReservationArgs'
import CreateRecurringReservationResponseDto from './DTOs/CreateRecurringReservationResponseDto'

@Resolver()
export default class CreateRecurringReservationResolver {
  constructor(private useCase: CreateRecurringReservationUseCase) {}

  @Authorized()
  @Mutation(() => CreateRecurringReservationResponseDto)
  async createRecurringReservation(
    @Ctx() { user }: ApolloContext,
    @Args() params: CreateRecurringReservationArgs,
  ): Promise<CreateRecurringReservationResponseDto> {
    const result = await this.useCase.execute({ ...params, redactedUser: user })

    if (result.isFailure()) throw result.error

    const { count, recurringId } = result.value
    return {
      count,
      recurringId: recurringId.toString(),
    }
  }
}

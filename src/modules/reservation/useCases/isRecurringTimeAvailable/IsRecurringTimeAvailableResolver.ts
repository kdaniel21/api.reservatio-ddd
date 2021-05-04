import { Args, Authorized, Query, Resolver } from 'type-graphql'
import IsRecurringTimeAvailableArgs from './DTOs/IsRecurringTimeAvailableArgs'
import IsRecurringTimeAvailableResponseDto from './DTOs/IsRecurringTimeAvailableResponseDto'
import IsRecurringTimeAvailableUseCase from './IsRecurringTimeAvailableUseCase'

@Resolver()
export default class IsRecurringTimeAvailableResolver {
  constructor(private useCase: IsRecurringTimeAvailableUseCase) {}

  @Authorized()
  @Query(() => IsRecurringTimeAvailableResponseDto)
  async isRecurringTimeAvailable(
    @Args() params: IsRecurringTimeAvailableArgs
  ): Promise<IsRecurringTimeAvailableResponseDto> {
    const result = await this.useCase.execute(params)

    if (result.isFailure()) throw result.error

    const availableTimes = result.value.availableTimes.map(time => time.startTime)
    const unavailableTimes = result.value.unavailableTimes.map(time => time.startTime)

    return { availableTimes, unavailableTimes }
  }
}

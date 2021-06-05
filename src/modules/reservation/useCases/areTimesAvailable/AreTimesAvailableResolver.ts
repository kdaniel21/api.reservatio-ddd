import { Arg, Authorized, Query, Resolver } from 'type-graphql'
import AreTimesAvailableResponseDto from './DTOs/AreTimesAvailableResponseDto'
import AreTimesAvailableUseCase from './AreTimesAvailableUseCase'
import TimeAvailableInputDto from './DTOs/AreTimesAvailableInputDto'

@Resolver()
export default class AreTimesAvailableResolver {
  constructor(private useCase: AreTimesAvailableUseCase) {}

  @Authorized()
  @Query(() => [AreTimesAvailableResponseDto])
  async areTimesAvailable(
    @Arg('timeProposals', () => [TimeAvailableInputDto]) timeProposals: TimeAvailableInputDto[]
  ): Promise<AreTimesAvailableResponseDto[]> {
    const result = await this.useCase.execute(timeProposals)

    if (result.isFailure()) throw result.error

    return result.value.map(time => ({
      startTime: time.time.startTime,
      endTime: time.time.endTime,
      locations: time.location,
      isTimeAvailable: time.isAvailable,
    }))
  }
}

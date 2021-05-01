import { ReservationLocationEnum } from '@modules/reservation/domain/ReservationLocation'
import { Args, Authorized, Query, Resolver } from 'type-graphql'
import IsTimeAvailableInputDto from './DTOs/IsTimeAvailableInputDto'
import IsTimeAvailableResponseDto from './DTOs/IsTimeAvailableResponseDto'
import IsTimeAvailableUseCase from './IsTimeAvailableUseCase'

@Resolver()
export default class IsTimeAvailableResolver {
  constructor(private useCase: IsTimeAvailableUseCase) {}

  @Authorized()
  @Query(() => IsTimeAvailableResponseDto)
  async isTimeAvailable(@Args() params: IsTimeAvailableInputDto): Promise<IsTimeAvailableResponseDto> {
    const tableTennis = params.locations.some(location => location === ReservationLocationEnum.TableTennis)
    const badminton = params.locations.some(location => location === ReservationLocationEnum.Badminton)

    const { startTime, endTime } = params
    const result = await this.useCase.execute({ startTime, endTime, locations: { badminton, tableTennis } })

    if (result.isFailure()) throw result.error

    const { isTimeAvailable } = result.value
    return { isTimeAvailable }
  }
}

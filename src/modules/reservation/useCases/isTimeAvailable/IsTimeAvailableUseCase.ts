import ReservationLocation from '@modules/reservation/domain/ReservationLocation'
import ReservationTime from '@modules/reservation/domain/ReservationTime'
import ReservationRepository from '@modules/reservation/repositories/ReservationRepository/ReservationRepository'
import { PromiseErrorOr } from '@shared/core/DomainError'
import { Result } from '@shared/core/Result'
import UseCase from '@shared/core/UseCase'
import IsTimeAvailableUseCaseDto from './DTOs/IsTimeAvailableUseCaseDto'
import IsTimeAvailableUseCaseResultDto from './DTOs/IsTimeAvailableUseCaseResultDto'
import { IsTimeAvailableErrors } from './IsTimeAvailableErrors'

export default class IsTimeAvailableUseCase extends UseCase<
  IsTimeAvailableUseCaseDto,
  IsTimeAvailableUseCaseResultDto
> {
  constructor(private reservationRepo: ReservationRepository) {
    super()
  }

  async executeImpl(request: IsTimeAvailableUseCaseDto): PromiseErrorOr<IsTimeAvailableUseCaseResultDto> {
    const { startTime, endTime, locations } = request

    const timeOrError = ReservationTime.create(startTime, endTime)
    const locationOrError = ReservationLocation.create(locations)

    const combinedResult = Result.combine([timeOrError, locationOrError])
    if (combinedResult.isFailure()) return Result.fail(combinedResult.error)

    const time = timeOrError.value

    const isInPastCorrection = 1 * 60 * 1000
    const isInPast = (Date.now() - isInPastCorrection) > startTime.getTime()
    if (isInPast) return Result.fail(IsTimeAvailableErrors.PastTimeError)

    const isTimeAvailableOrError = await this.reservationRepo.isTimeAvailable(time, locationOrError.value)
    if (isTimeAvailableOrError.isFailure()) return Result.fail(isTimeAvailableOrError.error)

    const isTimeAvailable = isTimeAvailableOrError.value
    return Result.ok({ isTimeAvailable })
  }
}

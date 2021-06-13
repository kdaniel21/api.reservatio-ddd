import ReservationLocation from '@modules/reservation/domain/ReservationLocation'
import ReservationTime from '@modules/reservation/domain/ReservationTime'
import ReservationRepository from '@modules/reservation/repositories/ReservationRepository/ReservationRepository'
import { PromiseErrorOr } from '@shared/core/DomainError'
import { Result } from '@shared/core/Result'
import UseCase from '@shared/core/UseCase/UseCase'
import AreTimesAvailableErrors from './AreTimesAvailableErrors'
import AreTimesAvailableUseCaseDto from './DTOs/AreTimesAvailableUseCaseDto'
import AreTimesAvailableUseCaseResultDto from './DTOs/AreTimesAvailableUseCaseResultDto'

export default class AreTimesAvailableUseCase extends UseCase<
  AreTimesAvailableUseCaseDto,
  AreTimesAvailableUseCaseResultDto
> {
  constructor(private reservationRepo: ReservationRepository) {
    super()
  }

  async executeImpl(timeProposals: AreTimesAvailableUseCaseDto): PromiseErrorOr<AreTimesAvailableUseCaseResultDto> {
    const timesToValidate = timeProposals.map(proposal => {
      const timeOrError = ReservationTime.create(proposal.startTime, proposal.endTime)
      const locationOrError = ReservationLocation.create(proposal.locations)

      const combinedResult = Result.combine([timeOrError, locationOrError])
      if (combinedResult.isFailure()) throw combinedResult.error

      const time = timeOrError.value
      const isInPast = Date.now() > time.startTime.getTime()
      if (isInPast) throw AreTimesAvailableErrors.PastTimeError

      return { time, location: locationOrError.value, excludedId: proposal.excludedReservationId }
    })

    const areTimesAvailableOrError = await this.reservationRepo.isTimeAvailableBulk(timesToValidate)
    if (areTimesAvailableOrError.isFailure()) throw areTimesAvailableOrError.error

    return Result.ok(areTimesAvailableOrError.value)
  }
}

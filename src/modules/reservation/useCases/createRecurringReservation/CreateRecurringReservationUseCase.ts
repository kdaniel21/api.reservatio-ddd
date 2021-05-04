import Reservation from '@modules/reservation/domain/Reservation'
import ReservationLocation from '@modules/reservation/domain/ReservationLocation'
import ReservationName from '@modules/reservation/domain/ReservationName'
import CustomerRepository from '@modules/reservation/repositories/CustomerRepository/CustomerRepository'
import ReservationRepository from '@modules/reservation/repositories/ReservationRepository/ReservationRepository'
import { PromiseErrorOr } from '@shared/core/DomainError'
import { Result } from '@shared/core/Result'
import UseCase from '@shared/core/UseCase'
import UniqueID from '@shared/domain/UniqueID'
import { CreateReservationErrors } from '../createReservation/CreateReservationErrors'
import IsRecurringTimeAvailableUseCase from '../isRecurringTimeAvailable/IsRecurringTimeAvailableUseCase'
import CreateRecurringReservationResultDto from './DTOs/CreateRecurringReservationResultDto'
import CreateRecurringReservationUseCaseDto from './DTOs/CreateRecurringReservationUseCaseDto'

export default class CreateRecurringReservationUseCase extends UseCase<
  CreateRecurringReservationUseCaseDto,
  CreateRecurringReservationResultDto
> {
  constructor(
    private isRecurringTimeAvailableUseCase: IsRecurringTimeAvailableUseCase,
    private customerRepo: CustomerRepository,
    private reservationRepo: ReservationRepository
  ) {
    super()
  }

  async executeImpl(
    request: CreateRecurringReservationUseCaseDto
  ): PromiseErrorOr<CreateRecurringReservationResultDto> {
    const nameOrError = ReservationName.create(request.name)
    const locationsOrError = ReservationLocation.create(request.locations)

    const combinedResult = Result.combine([nameOrError, locationsOrError])
    if (combinedResult.isFailure()) return Result.fail(combinedResult.error)

    const timeAvailabilityResult = await this.isRecurringTimeAvailableUseCase.execute(request)
    if (timeAvailabilityResult.isFailure()) return Result.fail(timeAvailabilityResult.error)

    const { availableTimes, unavailableTimes } = timeAvailabilityResult.value
    if (unavailableTimes?.length) return Result.fail(CreateReservationErrors.TimeNotAvailableError)

    const userId = new UniqueID(request.redactedUser.userId)
    const customerOrError = await this.customerRepo.findByUserId(userId)
    if (customerOrError.isFailure()) return Result.fail()

    const recurringId = new UniqueID()
    const reservationsResult = availableTimes.map(time =>
      Reservation.create({
        name: nameOrError.value,
        time,
        customer: customerOrError.value,
        locations: locationsOrError.value,
        recurringId,
      })
    )
    const combinedReservationResult = Result.combine(reservationsResult)
    if (combinedReservationResult.isFailure()) Result.fail(combinedReservationResult.error)

    const reservations: Reservation[] = reservationsResult.map(result => result.value)
    const saveResult = await this.reservationRepo.saveBulk(reservations)

    return saveResult.isSuccess()
      ? Result.ok({ count: reservations.length, recurringId })
      : Result.fail(saveResult.error)
  }
}

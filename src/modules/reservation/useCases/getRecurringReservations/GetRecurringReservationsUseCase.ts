import CustomerRepository from '@modules/reservation/repositories/CustomerRepository/CustomerRepository'
import ReservationRepository from '@modules/reservation/repositories/ReservationRepository/ReservationRepository'
import { AppError } from '@shared/core/AppError'
import { PromiseErrorOr } from '@shared/core/DomainError'
import { Result } from '@shared/core/Result'
import UseCase from '@shared/core/UseCase/UseCase'
import UniqueID from '@shared/domain/UniqueID'
import { GetReservationErrors } from '../getReservation/GetReservationErrors'
import GetRecurringReservationsUseCaseDto from './DTOs/GetRecurringReservationsUseCaseDto'
import GetRecurringReservationsUseCaseResultDto from './DTOs/GetRecurringReservationsUseCaseResultDto'

export default class GetRecurringReservationsUseCase extends UseCase<
  GetRecurringReservationsUseCaseDto,
  GetRecurringReservationsUseCaseResultDto
> {
  constructor(
    private readonly reservationRepo: ReservationRepository,
    private readonly customerRepo: CustomerRepository,
  ) {
    super()
  }

  async executeImpl(
    request: GetRecurringReservationsUseCaseDto,
  ): PromiseErrorOr<GetRecurringReservationsUseCaseResultDto> {
    const query: { [key: string]: any } = { recurringId: request.recurringId.toString(), isActive: true }
    // TODO: Decouple this from Prisma query language
    if (request.futureOnly) query.startTime = { gte: new Date() }

    const reservationsOrError = await this.reservationRepo.findMany(query)
    if (reservationsOrError.isFailure()) throw GetReservationErrors.ReservationNotFoundError

    const reservations = reservationsOrError.value

    const userId = new UniqueID(request.redactedUser.userId)
    const customerOrError = await this.customerRepo.findByUserId(userId)
    if (customerOrError.isFailure()) return Result.fail(AppError.NotAuthorizedError)

    const canAccess = reservations.every(reservation => reservation.canAccess(customerOrError.value))
    if (!canAccess) return Result.fail(AppError.NotAuthorizedError)

    return Result.ok({ reservations })
  }
}

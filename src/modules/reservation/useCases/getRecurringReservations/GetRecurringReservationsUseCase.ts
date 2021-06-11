import CustomerRole from '@modules/reservation/domain/CustomerRole'
import CustomerRepository from '@modules/reservation/repositories/CustomerRepository/CustomerRepository'
import ReservationRepository from '@modules/reservation/repositories/ReservationRepository/ReservationRepository'
import { PromiseErrorOr } from '@shared/core/DomainError'
import { Result } from '@shared/core/Result'
import UseCase from '@shared/core/UseCase'
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
    private readonly customerRepo: CustomerRepository
  ) {
    super()
  }

  async executeImpl(
    request: GetRecurringReservationsUseCaseDto
  ): PromiseErrorOr<GetRecurringReservationsUseCaseResultDto> {
    const query: { [key: string]: any } = { recurringId: request.recurringId.toString(), isActive: true }
    // TODO: Decouple this from Prisma query language
    if (request.futureOnly) query.startTime = { gte: new Date() }

    const reservationsOrError = await this.reservationRepo.findMany(query)
    if (reservationsOrError.isFailure()) return Result.fail(GetReservationErrors.ReservationNotFoundError)

    const reservations = reservationsOrError.value

    const userId = new UniqueID(request.redactedUser.userId)
    const doReservationsBelongToUser = reservations.every(reservation => reservation.customer.userId.equals(userId))

    if (!doReservationsBelongToUser) {
      const customerOrError = await this.customerRepo.findByUserId(userId)
      if (customerOrError.isFailure()) return Result.fail(GetReservationErrors.CustomerNotFoundError)

      const customer = customerOrError.value
      const isAdmin = customer.role === CustomerRole.Admin

      if (!isAdmin) return Result.fail(GetReservationErrors.ReservationNotAuthorizedError)
    }

    return Result.ok({ reservations })
  }
}

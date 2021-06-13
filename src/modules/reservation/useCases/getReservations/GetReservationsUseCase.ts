import Customer from '@modules/reservation/domain/Customer'
import CustomerRole from '@modules/reservation/domain/CustomerRole'
import InvalidReservationTimeError from '@modules/reservation/domain/errors/InvalidReservationTimeError'
import Reservation from '@modules/reservation/domain/Reservation'
import CustomerRepository from '@modules/reservation/repositories/CustomerRepository/CustomerRepository'
import ReservationRepository from '@modules/reservation/repositories/ReservationRepository/ReservationRepository'
import { PromiseErrorOr } from '@shared/core/DomainError'
import { Result } from '@shared/core/Result'
import UseCase from '@shared/core/UseCase'
import UniqueID from '@shared/domain/UniqueID'
import DateUtils from '@shared/utils/DateUtils'
import { GetReservationErrors } from '../getReservation/GetReservationErrors'
import GetReservationsUseCaseDto from './DTOs/GetReservationsUseCaseDto'
import GetReservationsUseCaseResultDto from './DTOs/GetReservationsUseCaseResultDto'

export default class GetReservationsUseCase extends UseCase<
  GetReservationsUseCaseDto,
  GetReservationsUseCaseResultDto
> {
  MAX_DAYS = 7

  constructor(private reservationRepo: ReservationRepository, private customerRepo: CustomerRepository) {
    super()
  }

  async executeImpl(request: GetReservationsUseCaseDto): PromiseErrorOr<GetReservationsUseCaseResultDto> {
    const startDateWithoutTime = DateUtils.removeTime(request.startDate)
    const endDateWithoutTime = DateUtils.removeTime(DateUtils.addDays(request.endDate, 1))

    const isEndDateBeforeStartDate = endDateWithoutTime.getTime() < startDateWithoutTime.getTime()
    if (isEndDateBeforeStartDate)
      return Result.fail(new InvalidReservationTimeError('The start of the date range must be before the end.'))

    const startAndEndDifferenceDays = DateUtils.differenceInCalendarDays(startDateWithoutTime, endDateWithoutTime)
    if (startAndEndDifferenceDays > this.MAX_DAYS)
      return Result.fail(
        new InvalidReservationTimeError(`The maximum date range that can be queried is ${this.MAX_DAYS}`),
      )

    const userId = new UniqueID(request.redactedUser.userId)
    const customerOrError = await this.customerRepo.findByUserId(userId)
    if (customerOrError.isFailure()) return Result.fail(GetReservationErrors.CustomerNotFoundError)

    const customer = customerOrError.value
    const reservationsOrError =
      customer.role === CustomerRole.Admin
        ? await this.getAllReservations(startDateWithoutTime, endDateWithoutTime)
        : await this.getReservationsForCustomer(startDateWithoutTime, endDateWithoutTime, customer)
    if (reservationsOrError.isFailure() && reservationsOrError.error) Result.fail(reservationsOrError.error)

    const reservations = reservationsOrError.isFailure() ? [] : reservationsOrError.value
    return Result.ok({ reservations })
  }

  private async getReservationsForCustomer(
    startDate: Date,
    endDate: Date,
    customer: Customer,
  ): PromiseErrorOr<Reservation[]> {
    // TODO: Decouple from the prisma query structure
    return this.reservationRepo.findMany({
      AND: [
        { AND: [{ startTime: { gte: startDate } }, { startTime: { lt: endDate } }] },
        { isActive: true },
        { OR: [{ endTime: { lt: new Date() }, customerId: customer.id.toString() }, { endTime: { gte: new Date() } }] },
      ],
    })
  }

  private async getAllReservations(startDate: Date, endDate: Date): PromiseErrorOr<Reservation[]> {
    return this.reservationRepo.findMany({ AND: [{ startTime: { gte: startDate } }, { startTime: { lte: endDate } }] })
  }
}

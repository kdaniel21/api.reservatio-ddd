import Customer from '@modules/reservation/domain/Customer'
import CustomerRole from '@modules/reservation/domain/CustomerRole'
import Reservation from '@modules/reservation/domain/Reservation'
import ReservationLocation from '@modules/reservation/domain/ReservationLocation'
import ReservationName from '@modules/reservation/domain/ReservationName'
import ReservationTime from '@modules/reservation/domain/ReservationTime'
import CustomerRepository from '@modules/reservation/repositories/CustomerRepository/CustomerRepository'
import ReservationRepository from '@modules/reservation/repositories/ReservationRepository/ReservationRepository'
import { ErrorOr, PromiseErrorOr } from '@shared/core/DomainError'
import { Result } from '@shared/core/Result'
import UseCase from '@shared/core/UseCase'
import UniqueID from '@shared/domain/UniqueID'
import DateUtils from '@shared/utils/DateUtils'
import AreTimesAvailableUseCase from '../areTimesAvailable/AreTimesAvailableUseCase'
import { CreateReservationErrors } from '../createReservation/CreateReservationErrors'
import { GetReservationErrors } from '../getReservation/GetReservationErrors'
import UpdateReservationUseCaseDto from './DTOs/UpdateReservationUseCaseDto'
import UpdateReservationUseCaseResultDto from './DTOs/UpdateReservationUseCaseResultDto'

export default class UpdateReservationUseCase extends UseCase<
  UpdateReservationUseCaseDto,
  UpdateReservationUseCaseResultDto
> {
  constructor(
    private readonly reservationRepo: ReservationRepository,
    private readonly customerRepo: CustomerRepository,
    private readonly areTimesAvailableUseCase: AreTimesAvailableUseCase,
  ) {
    super()
  }

  async executeImpl(request: UpdateReservationUseCaseDto): PromiseErrorOr<UpdateReservationUseCaseResultDto> {
    const userId = new UniqueID(request.redactedUser.userId)
    const customerOrError = await this.customerRepo.findByUserId(userId)
    if (customerOrError.isFailure()) return Result.fail(GetReservationErrors.ReservationNotAuthorizedError)

    // TODO: Remove Prisma query language dependency
    const connectedUpdateIds = request.connectedUpdates.map(id => id.toString())
    const reservationsToUpdateOrError = await this.reservationRepo.findMany({
      id: { in: [request.id.toString(), ...connectedUpdateIds] },
    })
    if (reservationsToUpdateOrError.isFailure()) throw new GetReservationErrors.ReservationNotFoundError()

    const customer = customerOrError.value
    const reservationsToUpdate = reservationsToUpdateOrError.value

    let startTimeDifferenceMs: number
    let endTimeDifferenceMs: number

    const { updatedProperties } = request
    let reservationsToSave: Reservation[] = []

    for (const reservationToUpdate of reservationsToUpdate) {
      const isReferenceReservationUpdated = reservationToUpdate.id.equals(request.id)

      const canUpdateReservation = this.canCustomerUpdateReservation(customer, reservationToUpdate)
      if (!canUpdateReservation) return Result.fail(GetReservationErrors.ReservationNotAuthorizedError)

      const updatedNameOrError = updatedProperties.name
        ? ReservationName.create(updatedProperties.name)
        : Result.ok(reservationToUpdate.name)
      const updatedLocationOrError = request.updatedProperties.locations
        ? ReservationLocation.create({
            badminton: request.updatedProperties.locations.badminton ?? reservationToUpdate.locations.badminton,
            tableTennis: request.updatedProperties.locations.tableTennis ?? reservationToUpdate.locations.tableTennis,
          })
        : Result.ok(reservationToUpdate.locations)
      let updatedTimeOrError: ErrorOr<ReservationTime>

      if (isReferenceReservationUpdated) {
        const timeOrError =
          updatedProperties.startTime || updatedProperties.endTime
            ? ReservationTime.create(
                updatedProperties.startTime || reservationToUpdate.time.startTime,
                updatedProperties.endTime || reservationToUpdate.time.endTime,
              )
            : Result.ok(reservationToUpdate.time)
        if (timeOrError.isFailure()) return Result.fail(timeOrError.error as any)
        const updatedTime = timeOrError.value

        startTimeDifferenceMs = updatedTime.startTime.getTime() - reservationToUpdate.time.startTime.getTime()
        endTimeDifferenceMs = updatedTime.endTime.getTime() - reservationToUpdate.time.endTime.getTime()

        updatedTimeOrError = Result.ok(updatedTime)
      } else {
        updatedTimeOrError =
          updatedProperties.startTime || updatedProperties.endTime
            ? ReservationTime.create(
                DateUtils.addMilliseconds(reservationToUpdate.time.startTime, startTimeDifferenceMs),
                DateUtils.addMilliseconds(reservationToUpdate.time.endTime, endTimeDifferenceMs),
              )
            : Result.ok(reservationToUpdate.time)
      }

      const combinedResult = Result.combine([updatedNameOrError, updatedTimeOrError, updatedLocationOrError])
      if (combinedResult.isFailure()) return Result.fail(combinedResult.error as any)

      const updatedReservationOrError = Reservation.create(
        {
          ...reservationToUpdate.props,
          name: updatedNameOrError.value,
          time: updatedTimeOrError.value,
          locations: updatedLocationOrError.value,
          isActive: updatedProperties.isActive ?? reservationToUpdate.isActive,
        },
        reservationToUpdate.id,
      )
      if (updatedReservationOrError.isFailure()) throw updatedReservationOrError.error

      reservationsToSave.push(updatedReservationOrError.value)
    }

    const shouldReValidateTime = this.shouldReValidateAvailability(updatedProperties)
    if (shouldReValidateTime) {
      const timeAvailabilityOrError = await this.areTimesAvailableUseCase.execute(
        reservationsToSave.map(({ time, locations, id }) => ({
          startTime: time.startTime,
          endTime: time.endTime,
          locations,
          excludedReservationId: id,
        })),
      )
      if (timeAvailabilityOrError.isFailure()) return Result.fail(timeAvailabilityOrError.error)

      const areAllTimesAvailable = timeAvailabilityOrError.value.every(({ isAvailable }) => isAvailable)
      if (!areAllTimesAvailable) return Result.fail(CreateReservationErrors.TimeNotAvailableError)
    }

    const saveResult = await this.reservationRepo.saveBulk(reservationsToSave)
    if (saveResult.isFailure()) return Result.fail(saveResult.error)

    return Result.ok({ reservation: reservationsToSave[0] })
  }

  private canCustomerUpdateReservation(customer: Customer, reservation: Reservation): boolean {
    const isAdmin = customer.role === CustomerRole.Admin

    const doesReservationBelongToCustomer = reservation.customer.id.equals(customer.id)
    const isReservationPast = reservation.time.startTime.getTime() < Date.now()
    const canNormalCustomerEdit = doesReservationBelongToCustomer && !isReservationPast && reservation.isActive

    return canNormalCustomerEdit || isAdmin
  }

  private shouldReValidateAvailability(updatedProperties: UpdateReservationUseCaseDto['updatedProperties']): boolean {
    type UpdateKeys = keyof UpdateReservationUseCaseDto['updatedProperties']
    const propertiesToReValidate: UpdateKeys[] = ['startTime', 'endTime', 'locations', 'isActive']

    return propertiesToReValidate.some(propertyName => updatedProperties.hasOwnProperty(propertyName))
  }
}

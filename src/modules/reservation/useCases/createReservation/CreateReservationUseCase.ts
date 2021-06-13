import Reservation from '@modules/reservation/domain/Reservation'
import ReservationLocation from '@modules/reservation/domain/ReservationLocation'
import ReservationName from '@modules/reservation/domain/ReservationName'
import ReservationTime from '@modules/reservation/domain/ReservationTime'
import CustomerRepository from '@modules/reservation/repositories/CustomerRepository/CustomerRepository'
import ReservationRepository from '@modules/reservation/repositories/ReservationRepository/ReservationRepository'
import { PromiseErrorOr } from '@shared/core/DomainError'
import { Result } from '@shared/core/Result'
import UseCase from '@shared/core/UseCase'
import UniqueID from '@shared/domain/UniqueID'
import AreTimesAvailableUseCase from '../areTimesAvailable/AreTimesAvailableUseCase'
import { CreateReservationErrors } from './CreateReservationErrors'
import CreateReservationUseCaseDto from './DTOs/CreateReservationUseCaseDto'
import CreateReservationUseCaseResultDto from './DTOs/CreateReservationUseCaseResultDto'

export default class CreateReservationUseCase extends UseCase<
  CreateReservationUseCaseDto,
  CreateReservationUseCaseResultDto
> {
  constructor(
    private areTimesAvailableUseCase: AreTimesAvailableUseCase,
    private reservationRepo: ReservationRepository,
    private customerRepo: CustomerRepository,
  ) {
    super()
  }

  async executeImpl(request: CreateReservationUseCaseDto): PromiseErrorOr<CreateReservationUseCaseResultDto> {
    const nameOrError = ReservationName.create(request.name)
    const timeOrError = ReservationTime.create(request.startTime, request.endTime)
    const { tableTennis, badminton } = request.locations
    const locationOrError = ReservationLocation.create({ tableTennis, badminton })

    const combinedResult = Result.combine([nameOrError, timeOrError, locationOrError])
    if (combinedResult.isFailure()) return Result.fail(combinedResult.error)

    const isTimeAvailableOrError = await this.areTimesAvailableUseCase.execute([request])
    if (isTimeAvailableOrError.isFailure()) return Result.fail(isTimeAvailableOrError.error)

    const { isAvailable: isTimeAvailable } = isTimeAvailableOrError.value[0]
    if (!isTimeAvailable) return Result.fail(CreateReservationErrors.TimeNotAvailableError)

    const customerOrError = await this.customerRepo.findByUserId(new UniqueID(request.user.userId))
    if (customerOrError.isFailure()) return Result.fail(customerOrError.error)

    const reservationOrError = Reservation.create({
      name: nameOrError.value,
      locations: locationOrError.value,
      time: timeOrError.value,
      customer: customerOrError.value,
    })
    if (reservationOrError.isFailure()) return Result.fail(reservationOrError.error)

    const reservation = reservationOrError.value
    const saveResult = await this.reservationRepo.save(reservation)

    return saveResult.isSuccess() ? Result.ok({ reservation }) : Result.fail(saveResult.error)
  }
}

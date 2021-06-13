import CustomerRepository from '@modules/reservation/repositories/CustomerRepository/CustomerRepository'
import ReservationRepository from '@modules/reservation/repositories/ReservationRepository/ReservationRepository'
import { AppError } from '@shared/core/AppError'
import { PromiseErrorOr } from '@shared/core/DomainError'
import { Result } from '@shared/core/Result'
import UseCase from '@shared/core/UseCase/UseCase'
import UniqueID from '@shared/domain/UniqueID'
import GetReservationUseCaseDto from './DTOs/GetReservationUseCaseDto'
import GetReservationUseCaseResultDto from './DTOs/GetReservationUseCaseResultDto'
import { GetReservationErrors } from './GetReservationErrors'

export default class GetReservationUseCase extends UseCase<GetReservationUseCaseDto, GetReservationUseCaseResultDto> {
  constructor(private reservationRepo: ReservationRepository, private customerRepo: CustomerRepository) {
    super()
  }

  async executeImpl(request: GetReservationUseCaseDto): PromiseErrorOr<GetReservationUseCaseResultDto> {
    const reservationOrError = await this.reservationRepo.findById(request.reservationId)
    if (reservationOrError.isFailure()) return Result.fail(GetReservationErrors.ReservationNotFoundError)

    const reservation = reservationOrError.value

    const userId = new UniqueID(request.redactedUser.userId)
    const customerOrError = await this.customerRepo.findByUserId(userId)
    if (customerOrError.isFailure()) return Result.fail(AppError.NotAuthorizedError)

    const canAccess = reservation.canAccess(customerOrError.value)
    if (!canAccess) return Result.fail(AppError.NotAuthorizedError)

    return Result.ok({ reservation })
  }
}

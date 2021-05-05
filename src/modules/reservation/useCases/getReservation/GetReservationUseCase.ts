import CustomerRole from '@modules/reservation/domain/CustomerRole'
import CustomerRepository from '@modules/reservation/repositories/CustomerRepository/CustomerRepository'
import ReservationRepository from '@modules/reservation/repositories/ReservationRepository/ReservationRepository'
import { PromiseErrorOr } from '@shared/core/DomainError'
import { Result } from '@shared/core/Result'
import UseCase from '@shared/core/UseCase'
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
    const doesReservationBelongToCustomer = reservation.customer.userId.equals(userId)

    if (!doesReservationBelongToCustomer) {
      const customerOrError = await this.customerRepo.findByUserId(userId)
      if (customerOrError.isFailure()) return Result.fail(GetReservationErrors.CustomerNotFoundError)

      const customer = customerOrError.value
      const isAdmin = customer.role === CustomerRole.Admin

      if (!isAdmin) return Result.fail(GetReservationErrors.ReservationNotAuthorizedError)
    }

    return Result.ok({ reservation })
  }
}

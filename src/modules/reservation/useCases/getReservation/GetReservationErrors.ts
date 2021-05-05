import { DomainError } from '@shared/core/DomainError'

export namespace GetReservationErrors {
  export class ReservationNotFoundError implements DomainError {
    readonly message = 'Reservation could not be found!'
    readonly code = 'RESERVATION_NOT_FOUND'
  }

  // TODO: Extract to shared errors file
  export class CustomerNotFoundError implements DomainError {
    readonly message = 'Customer profile could not be found!'
    readonly code = 'CUSTOMER_NOT_FOUND'
  }

  export class ReservationNotAuthorizedError implements DomainError {
    readonly message = 'You do not have access to this reservation!'
    readonly code = 'RESERVATION_NOT_AUTHORIZED'
  }
}

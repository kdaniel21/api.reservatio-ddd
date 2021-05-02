import { DomainError } from '@shared/core/DomainError'

export namespace CreateReservationErrors {
  export class TimeNotAvailableError implements DomainError {
    readonly message = 'This time period either collides with another reservation or is not available.'
    readonly code = 'TIME_NOT_AVAILABLE'
  }
}

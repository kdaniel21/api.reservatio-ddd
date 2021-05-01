import { DomainError } from '@shared/core/DomainError'

export default class InvalidReservationTimeError implements DomainError {
  readonly code = 'INVALID_TIME_SPAN'

  constructor(public readonly message: string) {}
}

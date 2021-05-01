import { DomainError } from '@shared/core/DomainError'

export namespace IsTimeAvailableErrors {
  export class PastTimeError implements DomainError {
    readonly message = 'Time cannot be in the past!'
    readonly code = 'PAST_TIME'
  }
}

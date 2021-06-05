import { DomainError } from '@shared/core/DomainError'

namespace AreTimesAvailableErrors {
  export class PastTimeError implements DomainError {
    readonly message = 'Time cannot be in the past!'
    readonly code = 'PAST_TIME'
  }
}

export default AreTimesAvailableErrors

import { DomainError } from '@shared/core/DomainError'

export namespace LoginErrors {
  export class InvalidCredentialsError implements DomainError {
    readonly message = 'Invalid email address or password. Please try again!'
    readonly code = 'INVALID_CREDENTIALS'
  }

  export class EmailAddressNotConfirmedError implements DomainError {
    readonly message = 'The email address has not been verified yet. Please verify it and try again!'
    readonly code = 'EMAIL_NOT_VERIFIED'
  }
}

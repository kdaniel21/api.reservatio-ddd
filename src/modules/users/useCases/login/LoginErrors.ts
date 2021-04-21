import { DomainError } from '@shared/core/DomainError'

export namespace LoginErrors {
  export class InvalidCredentialsError implements DomainError {
    readonly message = 'Invalid email address or password. Please try again!'
    readonly code = 'INVALID_CREDENTIALS'
  }
}

import { DomainError } from '@shared/core/DomainError'

export namespace ConfirmEmailErrors {
  export class InvalidEmailConfirmationToken implements DomainError {
    readonly message = 'Invalid email confirmation token!'
    readonly code = 'INVALID_EMAIL_CONFIRMATION_TOKEN'
  }
}

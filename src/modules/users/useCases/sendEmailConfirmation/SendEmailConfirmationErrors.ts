import { DomainError } from '@shared/core/DomainError'

export namespace SendEmailConfirmationErrors {
  export class EmailAlreadyConfirmed implements DomainError {
    readonly message = 'This email address is either not registered or is already confirmed!'
    readonly code = 'EMAIL_ALREADY_CONFIRMED'
  }
}

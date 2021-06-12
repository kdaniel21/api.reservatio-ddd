import { DomainError } from '@shared/core/DomainError'

export namespace CreateInvitationErrors {
  export class EmailAlreadyRegisteredError implements DomainError {
    readonly code = 'EMAIL_ALREADY_REGISTERED'
    readonly message = 'Email address is already registered!'
  }
}

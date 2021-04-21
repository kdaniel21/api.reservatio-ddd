import { DomainError } from '@shared/core/DomainError'

export namespace ResetPasswordErrors {
  export class NonExistentEmailAddress implements DomainError {
    readonly message = 'Email address is not registered.'
    readonly code = 'NON_EXISTENT_EMAIL'
  }
}

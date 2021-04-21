import { DomainError } from '@shared/core/DomainError'

export namespace ChangePasswordUsingTokenErrors {
  export class InvalidTokenError implements DomainError {
    readonly message = 'The provided token is either invalid or expired.'
    readonly code = 'INVALID_TOKEN'
  }
}

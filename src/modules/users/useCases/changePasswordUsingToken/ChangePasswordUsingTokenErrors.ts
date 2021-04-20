import { DomainError } from '@shared/core/DomainError'

export namespace ChangePasswordUsingTokenErrors {
  export class InvalidTokenError extends DomainError {
    constructor() {
      super({
        message: 'The provided token is either invalid or expired.',
        code: 'INVALID_TOKEN',
      })
    }
  }
}

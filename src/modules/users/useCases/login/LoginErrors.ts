import { DomainError } from '@shared/core/DomainError'

export namespace LoginErrors {
  export class InvalidCredentialsError extends DomainError {
    constructor() {
      super({
        message: 'Invalid email address or password. Please try again!',
        code: 'INVALID_CREDENTIALS',
      })
    }
  }
}

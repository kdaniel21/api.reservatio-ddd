import { DomainError } from '@shared/core/DomainError'

export namespace LogoutErrors {
  export class InvalidRefreshTokenError extends DomainError {
    constructor() {
      super({
        message: 'The provided refresh token does not exist on this user!',
        code: 'INVALID_REFRESH_TOKEN',
      })
    }
  }
}

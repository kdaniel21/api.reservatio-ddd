import { DomainError } from '@shared/core/DomainError'

export namespace RefreshAccessTokenErrors {
  export class InvalidRefreshTokenError extends DomainError {
    constructor() {
      super({ message: 'Invalid or expired refresh token.', code: 'INVALID_REFRESH_TOKEN' })
    }
  }
}

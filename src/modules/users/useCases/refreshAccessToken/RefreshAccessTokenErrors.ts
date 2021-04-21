import { DomainError } from '@shared/core/DomainError'

export namespace RefreshAccessTokenErrors {
  export class InvalidRefreshTokenError implements DomainError {
    readonly message = 'Invalid or expired refresh token.'
    readonly code = 'INVALID_REFRESH_TOKEN'
  }
}

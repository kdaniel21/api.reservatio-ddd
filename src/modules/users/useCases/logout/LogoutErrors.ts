import { DomainError } from '@shared/core/DomainError'

export namespace LogoutErrors {
  export class InvalidRefreshTokenError implements DomainError {
    readonly message = 'The provided refresh token does not exist on this user!'
    readonly code = 'INVALID_REFRESH_TOKEN'
  }
}

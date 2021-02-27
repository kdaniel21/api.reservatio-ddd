import { Failure } from '@shared/core/Result'
import UseCaseError from '@shared/core/UseCaseError'

export namespace RefreshAccessTokenErrors {
  export class InvalidRefreshTokenError extends Failure<UseCaseError> {
    constructor() {
      super({ message: 'Invalid or expired refresh token.', code: 'INVALID_REFRESH_TOKEN' })
    }
  }
}

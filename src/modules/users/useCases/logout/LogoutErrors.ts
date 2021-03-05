import { Failure } from '@shared/core/Result'
import UseCaseError from '@shared/core/UseCaseError'

export namespace LogoutErrors {
  export class InvalidRefreshTokenError extends Failure<UseCaseError> {
    constructor() {
      super({
        message: 'The provided refresh token does not exist on this user!',
        code: 'INVALID_REFRESH_TOKEN',
      })
    }
  }
}

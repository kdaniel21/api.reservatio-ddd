import { Failure } from '@shared/core/Result'
import UseCaseError from '@shared/core/UseCaseError'

export namespace ChangePasswordUsingTokenErrors {
  export class InvalidTokenError extends Failure<UseCaseError> {
    constructor() {
      super({
        message: 'The provided token is either invalid or expired.',
        code: 'INVALID_TOKEN',
      })
    }
  }
}

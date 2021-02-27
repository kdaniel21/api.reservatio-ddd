import { Failure } from '@shared/core/Result'
import UseCaseError from '@shared/core/UseCaseError'

export namespace LoginErrors {
  export class InvalidCredentialsError extends Failure<UseCaseError> {
    constructor() {
      super({
        message: 'Invalid email address or password. Please try again!',
        code: 'INVALID_CREDENTIALS',
      })
    }
  }
}

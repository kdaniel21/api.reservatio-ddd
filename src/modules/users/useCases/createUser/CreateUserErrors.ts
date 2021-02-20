import { Failure } from '@shared/core/Result'
import UseCaseError from '@shared/core/UseCaseError'

export namespace CreateUserError {
  export class EmailAlreadyExistsError extends Failure<UseCaseError> {
    constructor(email: string) {
      super({
        message: `The email address ${email} is already used by an existing user!`,
        code: 'EMAIL_ALREADY_EXISTS',
      })
    }
  }
}

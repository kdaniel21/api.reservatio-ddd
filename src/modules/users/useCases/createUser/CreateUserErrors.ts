import { DomainError } from '@shared/core/DomainError'

export namespace CreateUserError {
  export class EmailAlreadyExistsError extends DomainError {
    constructor(email: string) {
      super({
        message: `The email address ${email} is already used by an existing user!`,
        code: 'EMAIL_ALREADY_EXISTS',
      })
    }
  }
}

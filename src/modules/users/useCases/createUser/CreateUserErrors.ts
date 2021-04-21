import { DomainError } from '@shared/core/DomainError'

export namespace CreateUserError {
  export class EmailAlreadyExistsError implements DomainError {
    readonly message: string
    readonly code = 'EMAIL_ALREADY_EXISTS'

    constructor(email: string) {
      this.message = `The email address ${email} is already used by an existing user!`
    }
  }
}

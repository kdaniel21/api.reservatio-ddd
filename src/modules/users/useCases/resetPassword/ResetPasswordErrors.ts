import { DomainError } from '@shared/core/DomainError'
import { Failure } from '@shared/core/Result'

export namespace ResetPasswordErrors {
  export class NonExistentEmailAddress extends DomainError {
    constructor() {
      super({ message: 'Email address is not registered.', code: 'NON_EXISTENT_EMAIL' })
    }
  }
}

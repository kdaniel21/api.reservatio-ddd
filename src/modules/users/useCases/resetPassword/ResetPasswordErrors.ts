import { Failure } from '@shared/core/Result'
import UseCaseError from '@shared/core/UseCaseError'

export namespace ResetPasswordErrors {
  export class NonExistentEmailAddress extends Failure<UseCaseError> {
    constructor() {
      super({ message: 'Email address is not registered.', code: 'NON_EXISTENT_EMAIL' })
    }
  }
}

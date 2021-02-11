import { DomainError } from '@shared/core/DomainError'

export default class InvalidUserNameError extends DomainError {
  constructor(error: string) {
    super({ message: error })
  }
}

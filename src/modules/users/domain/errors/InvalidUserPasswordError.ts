import { DomainError } from '@shared/core/DomainError'

export class InvalidUserPasswordError extends DomainError {
  constructor(error: string) {
    super({ message: error })
  }
}

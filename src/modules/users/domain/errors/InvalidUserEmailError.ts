import { DomainError } from '@shared/core/DomainError'

export default class InvalidUserEmailError extends DomainError {
  constructor() {
    super({ message: 'Invalid email address!' })
  }
}

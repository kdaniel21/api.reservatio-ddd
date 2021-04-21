import { DomainError } from '@shared/core/DomainError'

export default class InvalidUserEmailError implements DomainError {
  public readonly message = 'Invalid email address!'
}

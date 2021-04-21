import { DomainError } from '@shared/core/DomainError'

export default class InvalidUserNameError implements DomainError {
  constructor(public readonly message: string) {}
}

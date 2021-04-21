import { DomainError } from '@shared/core/DomainError'

export class InvalidUserPasswordError implements DomainError {
  constructor(public readonly message: string) {}
}

import { DomainError } from './DomainError'

export namespace AppError {
  export class MissingArgumentError extends DomainError {
    constructor(message: string) {
      super({ message })
    }
  }
}

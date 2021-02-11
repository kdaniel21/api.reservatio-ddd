import { DomainError } from './DomainError'

export namespace AppError {
  export class UndefinedArgumentError extends DomainError {
    constructor(message: string) {
      super({ message })
    }
  }

  export class InputShortError extends DomainError {
    constructor(message: string) {
      super({ message })
    }
  }
}

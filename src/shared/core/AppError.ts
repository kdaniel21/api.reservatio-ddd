import { DomainError } from './DomainError'

export namespace AppError {
  export class UnexpectedError extends DomainError {
    constructor() {
      super({ message: 'Something went wrong unexpectedly. Please try again!' })
    }
  }

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

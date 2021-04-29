import { DomainError } from './DomainError'

export namespace AppError {
  export class UnexpectedError implements DomainError {
    readonly message = 'Something went wrong unexpectedly. Please try again!'
    readonly code = 'UNEXPECTED_ERROR'
  }

  export class UndefinedArgumentError implements DomainError {
    constructor(public readonly message: string) {}
  }

  export class InputShortError implements DomainError {
    constructor(public readonly message: string) {}
  }

  export abstract class ValidationError implements DomainError {
    readonly code = 'VALIDATION_ERROR'
    abstract readonly message: string
  }
}

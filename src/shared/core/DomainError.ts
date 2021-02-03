import { Either, Failure } from './Result'

interface DomainErrorDto {
  message: string
  error?: any
}

export type ErrorOr<S> = Either<DomainError, S>

export abstract class DomainError extends Failure<DomainErrorDto, any> {}

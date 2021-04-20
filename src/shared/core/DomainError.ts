import { Either, Failure } from './Result'

export interface DomainErrorDto {
  message: string
  code?: string
}

export const isDomainErrorDto = (object: any): object is DomainErrorDto => {
  return 'message' in object
}

export type ErrorOr<S = any> = Either<DomainErrorDto, S>

export abstract class DomainError extends Failure<DomainErrorDto, any> {}

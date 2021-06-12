import { Either } from './Result'

export interface DomainError {
  readonly message: string
  readonly code?: string
}

export const isDomainError = (object: any): object is DomainError => {
  return 'message' in object
}

export type ErrorOr<S = void> = Either<DomainError, S>

export type PromiseErrorOr<S = void> = Promise<ErrorOr<S>>

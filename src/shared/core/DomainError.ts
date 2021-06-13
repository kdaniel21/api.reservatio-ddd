import { Either } from './Result'

export interface DomainError {
  readonly message: string
  readonly code?: string
}

export const isDomainError = (object: any): object is DomainError => {
  return typeof object === 'object' && 'message' in object
}

type DomainErrorConstructor = new () => DomainError

export const isDomainErrorConstructor = (ErrorClass: any): ErrorClass is DomainErrorConstructor => {
  try {
    const errorInstance = new ErrorClass()

    return !!errorInstance && isDomainError(errorInstance)
  } catch {
    return false
  }
}

export type ErrorOr<S = void> = Either<DomainError, S>

export type PromiseErrorOr<S = void> = Promise<ErrorOr<S>>

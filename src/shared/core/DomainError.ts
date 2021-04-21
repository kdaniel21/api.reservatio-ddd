import { Either } from './Result'

export interface DomainError {
  message: string
  code?: string
}

export const isDomainError = (object: any): object is DomainError => {
  return 'message' in object
}

export type ErrorOr<S = any> = Either<DomainError, S>

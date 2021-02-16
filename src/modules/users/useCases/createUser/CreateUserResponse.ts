import { AppError } from '@shared/core/AppError'
import { Either, Success } from '@shared/core/Result'
import { CreateUserError } from './CreateUserErrors'

export type CreateUserResponse = Either<
  CreateUserError.EmailAlreadyExistsError | AppError.UnexpectedError,
  Success<any, any>
>

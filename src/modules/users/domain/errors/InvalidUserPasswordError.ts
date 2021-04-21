import { AppError } from '@shared/core/AppError'

export class InvalidUserPasswordError extends AppError.ValidationError {
  constructor(public readonly message: string) {
    super()
  }
}

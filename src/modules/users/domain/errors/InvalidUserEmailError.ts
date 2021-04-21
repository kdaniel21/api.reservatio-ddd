import { AppError } from '@shared/core/AppError'

export default class InvalidUserEmailError extends AppError.ValidationError {
  readonly message = 'Invalid email address!'
}

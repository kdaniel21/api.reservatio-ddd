import { AppError } from '@shared/core/AppError'

export default class InvalidAccessTokenError extends AppError.ValidationError {
  readonly message = 'The provided access token is either invalid or expired.'
}

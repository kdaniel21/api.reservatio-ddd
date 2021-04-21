import { AppError } from '@shared/core/AppError'
import { DomainError } from '@shared/core/DomainError'

export default class InvalidAccessTokenError extends AppError.ValidationError {
  readonly message = 'The provided access token is either invalid or expired.'
}

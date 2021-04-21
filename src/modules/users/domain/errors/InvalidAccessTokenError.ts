import { DomainError } from '@shared/core/DomainError'

export default class InvalidAccessTokenError implements DomainError {
  public readonly message = 'The provided access token is either invalid or expired.'
}

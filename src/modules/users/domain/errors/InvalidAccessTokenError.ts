import { DomainError } from '@shared/core/DomainError'

export default class InvalidAccessTokenError extends DomainError {
  constructor() {
    super({ message: 'The provided access token is either invalid or expired.' })
  }
}

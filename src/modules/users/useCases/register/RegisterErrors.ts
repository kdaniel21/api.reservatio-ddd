import { DomainError } from '@shared/core/DomainError'

export namespace RegisterErrors {
  export class InvalidInvitationError implements DomainError {
    readonly message = 'The provided invitation token is either invalid or expired!'
    readonly code = 'INVALID_INVITATION'
  }
}

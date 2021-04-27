import { DomainError } from '@shared/core/DomainError'
import UniqueID from '@shared/domain/UniqueID'

export namespace GetCurrentUserErrors {
  export class UserNotFoundError implements DomainError {
    readonly message: string
    readonly code = 'USER_NOT_FOUND'

    constructor(userId: UniqueID) {
      this.message = `User with ID ${userId.toString()} could not be found!`
    }
  }
}

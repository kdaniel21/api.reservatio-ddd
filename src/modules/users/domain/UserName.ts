import { DomainError, ErrorOr } from '@shared/core/DomainError'
import { Guard } from '@shared/core/Guard'
import { Result } from '@shared/core/Result'
import ValueObject from '@shared/domain/ValueObject'

interface UserNameProps {
  name: string
}

export class InvalidUserNameError extends DomainError {
  constructor(error: string) {
    super({ message: error })
  }
}

export default class UserName extends ValueObject<UserNameProps> {
  static MAX_NAME_LENGTH = 25

  get value() {
    return this.props.name
  }

  private constructor(public props: UserNameProps) {
    super(props)
  }

  static create(name: string): ErrorOr<UserName> {
    const guardArgument = { argument: name, argumentName: 'name' }

    const usernameResult = Guard.againstNullOrUndefined(guardArgument)
    const maxLengthResult = Guard.againstLongerThan(this.MAX_NAME_LENGTH, guardArgument)

    const combinedResult = Guard.combine([usernameResult, maxLengthResult])
    if (!combinedResult.isSuccess) {
      const message = combinedResult.message as string

      return Result.fail(new InvalidUserNameError(message))
    }

    const userName = new UserName({ name })
    return Result.ok(userName)
  }
}

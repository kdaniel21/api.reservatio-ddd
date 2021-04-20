import { ErrorOr } from '@shared/core/DomainError'
import { Guard } from '@shared/core/Guard'
import { Result } from '@shared/core/Result'
import ValueObject from '@shared/domain/ValueObject'
import InvalidUserNameError from './errors/InvalidUserNameError'

interface UserNameProps {
  name: string
}

export default class UserName extends ValueObject<UserNameProps> {
  static MAX_NAME_LENGTH = 25
  static MIN_NAME_LENGTH = 5

  get value() {
    return this.props.name
  }

  private constructor(props: UserNameProps) {
    super(props)
  }

  static create(name: string): ErrorOr<UserName> {
    const guardArgument = { argument: name, argumentName: 'name' }

    const usernameResult = Guard.againstNullOrUndefined(guardArgument)
    const maxLengthResult = Guard.againstLongerThan(this.MAX_NAME_LENGTH, guardArgument)
    const minLengthResult = Guard.againstShorterThan(this.MIN_NAME_LENGTH, guardArgument)

    const combinedResult = Guard.combine([usernameResult, maxLengthResult, minLengthResult])
    if (!combinedResult.isSuccess) {
      const message = combinedResult.message as string

      return new InvalidUserNameError(message)
    }

    const userName = new UserName({ name })
    return Result.ok(userName)
  }
}

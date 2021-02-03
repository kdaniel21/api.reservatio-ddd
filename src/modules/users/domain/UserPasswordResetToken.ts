import { ErrorOr } from '@shared/core/DomainError'
import { Result } from '@shared/core/Result'
import { TokenValueObject, TokenValueObjectProps } from '@shared/domain/TokenValueObject'

export default class UserPasswordResetToken extends TokenValueObject {
  static TOKEN_LENGTH = 30
  static EXPIRATION_HOURS = 12

  private constructor(public props: TokenValueObjectProps) {
    super(props)
  }

  static create(props: TokenValueObjectProps): ErrorOr<UserPasswordResetToken> {
    const validPropsOrError = TokenValueObject.createValueObject(props)

    if (validPropsOrError.isFailure()) return Result.fail(validPropsOrError.value)

    const validProps = validPropsOrError.value as TokenValueObjectProps
    const userPasswordResetToken = new UserPasswordResetToken(validProps)
    return Result.ok(userPasswordResetToken)
  }
}

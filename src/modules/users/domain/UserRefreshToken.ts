import { ErrorOr } from '@shared/core/DomainError'
import { Result } from '@shared/core/Result'
import {
  TokenValueObject,
  TokenValueObjectOptions,
  TokenValueObjectProps,
} from '@shared/domain/TokenValueObject'

export default class UserRefreshToken extends TokenValueObject {
  static tokenOptions: TokenValueObjectOptions = {
    TOKEN_LENGTH: 30,
    EXPIRATION_HOURS: 30 * 24,
  }

  private constructor(props: TokenValueObjectProps) {
    super(props)
  }

  static create(props?: TokenValueObjectProps): ErrorOr<UserRefreshToken> {
    const validPropsOrError = TokenValueObject.createValueObject(props, this.tokenOptions)

    if (validPropsOrError.isFailure()) return Result.fail(validPropsOrError.error)

    const validProps = validPropsOrError.value as TokenValueObjectProps
    const userPasswordResetToken = new UserRefreshToken(validProps)
    return Result.ok(userPasswordResetToken)
  }
}

import { ErrorOr } from '@shared/core/DomainError'
import { Result } from '@shared/core/Result'
import { TokenEntity, TokenEntityOptions, TokenEntityProps } from '@shared/domain/TokenEntity'
import UniqueID from '@shared/domain/UniqueID'

export default class UserPasswordResetToken extends TokenEntity {
  static tokenOptions: TokenEntityOptions = {
    TOKEN_LENGTH: 30,
    EXPIRATION_HOURS: 12,
  }

  private constructor(props: TokenEntityProps) {
    super(props)
  }

  static create(props?: TokenEntityProps, id?: UniqueID): ErrorOr<UserPasswordResetToken> {
    const validPropsOrError = TokenEntity.validateProps(props, id, this.tokenOptions)

    if (validPropsOrError.isFailure()) return Result.fail(validPropsOrError.error)

    const validProps = validPropsOrError.value as TokenEntityProps
    const userPasswordResetToken = new UserPasswordResetToken(validProps)
    return Result.ok(userPasswordResetToken)
  }
}

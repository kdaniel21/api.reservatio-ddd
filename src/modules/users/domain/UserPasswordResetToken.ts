import config from '@config'
import { ErrorOr } from '@shared/core/DomainError'
import { Result } from '@shared/core/Result'
import { TokenEntity, TokenEntityOptions, TokenEntityProps } from '@shared/domain/TokenEntity'
import UniqueID from '@shared/domain/UniqueID'

export default class UserPasswordResetToken extends TokenEntity {
  static tokenOptions: TokenEntityOptions = {
    tokenLength: config.auth.passwordResetTokenLength,
    expirationHours: config.auth.passwordResetTokenExpirationHours,
  }

  private constructor(props: TokenEntityProps, id?: UniqueID) {
    super(props, id)
  }

  static create(props?: TokenEntityProps, id?: UniqueID): ErrorOr<UserPasswordResetToken> {
    const validPropsOrError = TokenEntity.validateProps(props, id, this.tokenOptions)

    if (validPropsOrError.isFailure()) return Result.fail(validPropsOrError.error)

    const validProps = validPropsOrError.value
    const userPasswordResetToken = new UserPasswordResetToken(validProps, id)
    return Result.ok(userPasswordResetToken)
  }
}

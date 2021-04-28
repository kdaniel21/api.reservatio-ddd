import config from '@config'
import { ErrorOr } from '@shared/core/DomainError'
import { Result } from '@shared/core/Result'
import { TokenEntity, TokenEntityOptions, TokenEntityProps } from '@shared/domain/TokenEntity'
import UniqueID from '@shared/domain/UniqueID'

export interface UserRefreshTokenProps extends TokenEntityProps {
  userId: UniqueID
}

export default class UserRefreshToken extends TokenEntity<UserRefreshTokenProps> {
  static tokenOptions: TokenEntityOptions = {
    tokenLength: config.auth.refreshTokenLength,
    expirationHours: config.auth.refreshTokenExpirationHours,
  }

  get userId(): UniqueID {
    return this.props.userId
  }

  private constructor(props: UserRefreshTokenProps, id?: UniqueID) {
    super(props, id)
  }

  static create(props?: UserRefreshTokenProps, id?: UniqueID): ErrorOr<UserRefreshToken> {
    const validPropsOrError = TokenEntity.validateProps(props, id, this.tokenOptions)

    if (validPropsOrError.isFailure()) return Result.fail(validPropsOrError.error)

    const validProps = { ...props, ...validPropsOrError.value }
    const userPasswordResetToken = new UserRefreshToken(validProps, id)
    return Result.ok(userPasswordResetToken)
  }
}

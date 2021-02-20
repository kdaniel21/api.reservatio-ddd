import { ErrorOr } from '@shared/core/DomainError'
import { Result } from '@shared/core/Result'
import { TokenEntity, TokenEntityOptions, TokenEntityProps } from '@shared/domain/TokenEntity'
import UniqueID from '@shared/domain/UniqueID'

export default class UserRefreshToken extends TokenEntity {
  static tokenOptions: TokenEntityOptions = {
    TOKEN_LENGTH: 30,
    EXPIRATION_HOURS: 30 * 24,
  }

  get tokenId(): string {
    return 'foo'
  }

  private constructor(props: TokenEntityProps) {
    super(props)
  }

  static create(props?: TokenEntityProps, id?: UniqueID): ErrorOr<UserRefreshToken> {
    const validPropsOrError = TokenEntity.createEntity(props, id, this.tokenOptions)

    if (validPropsOrError.isFailure()) return Result.fail(validPropsOrError.error)

    const validProps = validPropsOrError.value as TokenEntityProps
    const userPasswordResetToken = new UserRefreshToken(validProps)
    return Result.ok(userPasswordResetToken)
  }
}

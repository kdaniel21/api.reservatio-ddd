import config from '@config'
import { ErrorOr } from '@shared/core/DomainError'
import { Result } from '@shared/core/Result'
import { TokenEntity, TokenEntityProps } from '@shared/domain/TokenEntity'
import UniqueID from '@shared/domain/UniqueID'

export default class UserEmailConfirmationToken extends TokenEntity {
  static tokenOptions = { tokenLength: config.auth.emailConfirmationTokenLength }

  private constructor(props: TokenEntityProps, id: UniqueID) {
    super(props, id)
  }

  static create(props?: TokenEntityProps, id?: UniqueID): ErrorOr<UserEmailConfirmationToken> {
    const validPropsOrError = TokenEntity.validateProps(props, id, this.tokenOptions)

    if (validPropsOrError.isFailure()) return Result.fail(validPropsOrError.error)

    const validProps = validPropsOrError.value
    const userEmailConfirmationToken = new UserEmailConfirmationToken(validProps, id)
    return Result.ok(userEmailConfirmationToken)
  }
}

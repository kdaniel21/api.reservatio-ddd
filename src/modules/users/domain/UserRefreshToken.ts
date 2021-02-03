import { ErrorOr } from '@shared/core/DomainError'
import { Guard } from '@shared/core/Guard'
import { Result } from '@shared/core/Result'
import {
  TokenValueObject,
  TokenValueObjectOptions,
  TokenValueObjectProps,
} from '@shared/domain/TokenValueObject'
import TextUtils from '@shared/utils/TextUtils'
import { MissingArgumentError } from './User'

export default class UserRefreshToken extends TokenValueObject<UserRefreshToken> {
  options: TokenValueObjectOptions = {
    TOKEN_LENGTH: 30,
    EXPIRATION_HOURS: 30 * 24,
  }

  private constructor(props: TokenValueObjectProps) {
    super(props, UserRefreshToken, {
      TOKEN_LENGTH: 30,
      EXPIRATION_HOURS: 30 * 24,
    })
  }
}

import { ErrorOr } from '@shared/core/DomainError'
import { Guard } from '@shared/core/Guard'
import { Result } from '@shared/core/Result'
import TokenValueObject from '@shared/domain/TokenValueObject'
import ValueObject from '@shared/domain/ValueObject'
import TextUtils from '@shared/utils/TextUtils'
import { MissingArgumentError } from './User'

export default class UserPasswordResetToken extends TokenValueObject {
  static TOKEN_LENGTH = 30
  static EXPIRATION_HOURS = 12
}

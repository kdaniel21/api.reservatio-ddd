import { MissingArgumentError } from '@modules/users/domain/User'
import { ErrorOr } from '@shared/core/DomainError'
import { Guard } from '@shared/core/Guard'
import { Result } from '@shared/core/Result'
import TextUtils from '@shared/utils/TextUtils'
import ValueObject from './ValueObject'

export interface TokenValueObjectProps {
  token: string
  expiresAt: Date
}

export interface TokenValueObjectOptions {
  EXPIRATION_HOURS: number
  TOKEN_LENGTH: number
}

export abstract class TokenValueObject extends ValueObject<TokenValueObjectProps> {
  static DEFAULT_EXPIRATION_HOURS = 6
  static DEFAULT_TOKEN_LENGTH = 20

  get token() {
    return this.props.token
  }

  get expiresAt() {
    return this.props.expiresAt
  }

  get isExpired(): boolean {
    return this.props.expiresAt.getTime() > Date.now()
  }

  constructor(props: TokenValueObjectProps) {
    super(props)
  }

  static createValueObject(
    props: TokenValueObjectProps,
    options?: TokenValueObjectOptions
  ): ErrorOr<TokenValueObjectProps> {
    const TOKEN_LENGTH = options?.TOKEN_LENGTH || this.DEFAULT_TOKEN_LENGTH
    const EXPIRATION_HOURS = options?.EXPIRATION_HOURS || this.DEFAULT_EXPIRATION_HOURS

    if (!props) {
      const token = TextUtils.generateRandomCharacters(TOKEN_LENGTH).toUpperCase()
      const expiresAt = new Date(Date.now() + EXPIRATION_HOURS * 60 * 60 * 1000)

      return Result.ok({ token, expiresAt })
    }

    const guardResult = Guard.againstNullOrUndefinedBulk([
      { argument: props.token, argumentName: 'token' },
      { argument: props.expiresAt, argumentName: 'expiration' },
    ])
    if (!guardResult.isSuccess)
      return Result.fail(new MissingArgumentError(guardResult.message as string))

    return Result.ok(props)
  }

  isCodeValid(code: string): boolean {
    return !this.isExpired && code.toUpperCase() === this.token.toUpperCase()
  }
}

import { ErrorOr } from '@shared/core/DomainError'
import { Guard } from '@shared/core/Guard'
import { Result } from '@shared/core/Result'
import TextUtils from '@shared/utils/TextUtils'
import ValueObject from './ValueObject'
import { AppError } from '@shared/core/AppError'

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
    return this.props.expiresAt.getTime() < Date.now()
  }

  constructor(props: TokenValueObjectProps) {
    super(props)
  }

  protected static createValueObject(
    props?: TokenValueObjectProps,
    options?: TokenValueObjectOptions
  ): ErrorOr<TokenValueObjectProps> {
    const TOKEN_LENGTH = options?.TOKEN_LENGTH || this.DEFAULT_TOKEN_LENGTH
    const EXPIRATION_HOURS = options?.EXPIRATION_HOURS || this.DEFAULT_EXPIRATION_HOURS

    if (!props) {
      const newToken = this.generateNewTokenObject(TOKEN_LENGTH, EXPIRATION_HOURS)
      return Result.ok(newToken)
    }

    const guardResultUndefined = Guard.againstNullOrUndefinedBulk([
      { argument: props.token, argumentName: 'token' },
      { argument: props.expiresAt, argumentName: 'expiration' },
    ])
    if (!guardResultUndefined.isSuccess)
      return Result.fail(
        new AppError.UndefinedArgumentError(guardResultUndefined.message as string)
      )

    const guardResultLength = Guard.againstShorterThan(TOKEN_LENGTH, {
      argument: props.token,
      argumentName: 'token',
    })
    if (!guardResultLength.isSuccess)
      return Result.fail(new AppError.InputShortError(guardResultLength.message as string))

    return Result.ok(props)
  }

  isCodeValid(code: string): boolean {
    return !this.isExpired && code.toUpperCase() === this.token.toUpperCase()
  }

  private static generateNewTokenObject(length: number, expirationHours: number) {
    const token = TextUtils.generateRandomCharacters(length).toUpperCase()
    const expiresAt = new Date(Date.now() + expirationHours * 60 * 60 * 1000)

    return { token, expiresAt }
  }
}

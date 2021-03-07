import { ErrorOr } from '@shared/core/DomainError'
import { Guard } from '@shared/core/Guard'
import { Result } from '@shared/core/Result'
import TextUtils from '@shared/utils/TextUtils'
import { AppError } from '@shared/core/AppError'
import UniqueID from './UniqueID'
import Entity from './Entity'

export interface TokenEntityProps {
  token?: string
  expiresAt?: Date
}

export interface TokenEntityOptions {
  EXPIRATION_HOURS: number
  TOKEN_LENGTH: number
}

export abstract class TokenEntity<T extends TokenEntityProps = TokenEntityProps> extends Entity<T> {
  static DEFAULT_EXPIRATION_HOURS = 6
  static DEFAULT_TOKEN_LENGTH = 20

  readonly isHashed: boolean

  get token(): string {
    if (this.isHashed) throw new Error()

    return this.token
  }

  get hashedToken(): string {
    return this.isHashed ? this.token : TextUtils.hashText(this.token)
  }

  get expiresAt(): Date {
    return this.props.expiresAt
  }

  get isExpired(): boolean {
    return this.props.expiresAt.getTime() < Date.now()
  }

  constructor(props: T, id?: UniqueID) {
    super(props, id)

    this.isHashed = !!id
  }

  isTokenValid(code: string): boolean {
    let hashedCode = this.isHashed ? TextUtils.hashText(code) : code
    return !this.isExpired && hashedCode === this.token
  }

  protected static validateProps(
    props?: TokenEntityProps,
    id?: UniqueID,
    options?: TokenEntityOptions
  ): ErrorOr<TokenEntityProps> {
    const TOKEN_LENGTH = options?.TOKEN_LENGTH || this.DEFAULT_TOKEN_LENGTH
    const EXPIRATION_HOURS = options?.EXPIRATION_HOURS || this.DEFAULT_EXPIRATION_HOURS

    if (!id) {
      const newToken = this.generateNewTokenObject(TOKEN_LENGTH, EXPIRATION_HOURS)
      return Result.ok(newToken)
    }

    const guardResultUndefined = Guard.againstNullOrUndefinedBulk([
      { argument: props.token, argumentName: 'token' },
      { argument: props.expiresAt, argumentName: 'expiration' },
    ])
    if (!guardResultUndefined.isSuccess)
      return Result.fail(new AppError.UndefinedArgumentError(guardResultUndefined.message))

    return Result.ok(props)
  }

  private static generateNewTokenObject(length: number, expirationHours: number) {
    const token = TextUtils.generateRandomCharacters(length).toUpperCase()
    const expiresAt = new Date(Date.now() + expirationHours * 60 * 60 * 1000)

    return { token, expiresAt }
  }
}

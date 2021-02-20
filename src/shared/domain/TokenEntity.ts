import { ErrorOr } from '@shared/core/DomainError'
import { Guard } from '@shared/core/Guard'
import { Result } from '@shared/core/Result'
import TextUtils from '@shared/utils/TextUtils'
import { AppError } from '@shared/core/AppError'
import UniqueID from './UniqueID'
import Entity from './Entity'

export interface TokenEntityProps {
  token: string
  expiresAt: Date
}

export interface TokenEntityOptions {
  EXPIRATION_HOURS: number
  TOKEN_LENGTH: number
}

export abstract class TokenEntity extends Entity<TokenEntityProps> {
  static DEFAULT_EXPIRATION_HOURS = 6
  static DEFAULT_TOKEN_LENGTH = 20

  readonly isHashed: boolean

  get tokenId(): string {
    return this.id.toString()
  }

  get token(): string {
    return this.props.token
  }

  get expiresAt(): Date {
    return this.props.expiresAt
  }

  get isExpired(): boolean {
    return this.props.expiresAt.getTime() < Date.now()
  }

  constructor(props: TokenEntityProps, id?: UniqueID) {
    super(props, id)

    this.isHashed = !!id
  }
  
  isTokenValid(code: string): boolean {
    let token = this.isHashed ? TextUtils.hashText(this.token) : this.token
    return !this.isExpired && code.toUpperCase() === token.toUpperCase()
  }

  getHashedValue(): string {
    if (this.isHashed) return this.token

    return TextUtils.hashText(this.token)
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

  private static generateNewTokenObject(length: number, expirationHours: number) {
    const token = TextUtils.generateRandomCharacters(length).toUpperCase()
    const expiresAt = new Date(Date.now() + expirationHours * 60 * 60 * 1000)

    return { token, expiresAt }
  }
}

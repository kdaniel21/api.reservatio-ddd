import { ErrorOr } from '@shared/core/DomainError'
import { Guard, GuardArguments } from '@shared/core/Guard'
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
  tokenLength: number
  expirationHours?: number
}

export abstract class TokenEntity<T extends TokenEntityProps = TokenEntityProps> extends Entity<T> {
  static DEFAULT_TOKEN_LENGTH = 20

  readonly isHashed: boolean

  get token(): string {
    if (this.isHashed) throw new Error()

    return this.props.token
  }

  get hashedToken(): string {
    return this.isHashed ? this.props.token : TextUtils.hashText(this.props.token)
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

  isTokenValid(tokenToValidate: string): boolean {
    const hashedTokenToValidate = TextUtils.hashText(tokenToValidate)
    return !this.isExpired && hashedTokenToValidate === this.hashedToken
  }

  protected static validateProps(
    props?: TokenEntityProps,
    id?: UniqueID,
    options?: TokenEntityOptions
  ): ErrorOr<TokenEntityProps> {
    const tokenLength = options?.tokenLength || this.DEFAULT_TOKEN_LENGTH
    const { expirationHours } = options

    if (!id) {
      const newToken = this.generateNewTokenObject(tokenLength, expirationHours)
      return Result.ok(newToken)
    }

    const guard: GuardArguments[] = [{ argument: props.token, argumentName: 'token' }]
    if (options.expirationHours) guard.push({ argument: props.expiresAt, argumentName: 'expiration' })

    const guardResultUndefined = Guard.againstNullOrUndefinedBulk(guard)
    if (!guardResultUndefined.isSuccess)
      return Result.fail(new AppError.UndefinedArgumentError(guardResultUndefined.message))

    return Result.ok(props)
  }

  private static generateNewTokenObject(length: number, expirationHours?: number) {
    const token = TextUtils.generateRandomCharacters(length).toUpperCase()
    const expiresAt = expirationHours ? new Date(Date.now() + expirationHours * 60 * 60 * 1000) : undefined

    return { token, expiresAt }
  }
}

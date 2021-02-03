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

export abstract class TokenValueObject<T> extends ValueObject<TokenValueObjectProps> {
  get token() {
    return this.props.token
  }

  get expiresAt() {
    return this.props.expiresAt
  }

  get isExpired(): boolean {
    return this.props.expiresAt.getTime() > Date.now()
  }

  constructor(
    props: TokenValueObjectProps,
    private modelConstructor: new (props: TokenValueObjectProps) => T,
    private options: TokenValueObjectOptions
  ) {
    super(props)
  }

  protected create(props: TokenValueObjectProps): ErrorOr<T> {
    const { TOKEN_LENGTH, EXPIRATION_HOURS } = this.options

    if (!props) {
      const token = TextUtils.generateRandomCharacters(TOKEN_LENGTH).toUpperCase()
      const expiresAt = new Date(Date.now() + EXPIRATION_HOURS * 60 * 60 * 1000)

      return Result.ok(new this.modelConstructor({ token, expiresAt }))
    }

    const guardResult = Guard.againstNullOrUndefinedBulk([
      { argument: props.token, argumentName: 'token' },
      { argument: props.expiresAt, argumentName: 'expiration' },
    ])
    if (!guardResult.isSuccess)
      return Result.fail(new MissingArgumentError(guardResult.message as string))

    return Result.ok(new this.modelConstructor(props))
  }

  isCodeValid(code: string): boolean {
    return !this.isExpired && code.toUpperCase() === this.token.toUpperCase()
  }
}

import AggregateRoot from '@shared/domain/AggregateRoot'
import UniqueID from '@shared/domain/UniqueID'
import { ErrorOr } from '@shared/core/DomainError'
import { Guard } from '@shared/core/Guard'
import { Result } from '@shared/core/Result'
import { AppError } from '@shared/core/AppError'
import UserPasswordResetToken from './UserPasswordResetToken'
import UserPassword from './UserPassword'
import UserName from './UserName'
import UserEmail from './UserEmail'
import UserRefreshToken from './UserRefreshToken'
import UserCreatedEvent from './events/UserCreatedEvent'
import PasswordResetTokenCreatedEvent from './events/PasswordResetTokenCreatedEvent'
import PasswordChangedEvent from './events/PasswordChangedEvent'
import UserEmailConfirmationToken from './UserEmailConfirmationToken'

interface UserProps {
  email: UserEmail
  name: UserName
  password: UserPassword
  refreshTokens?: UserRefreshToken[]
  passwordResetToken?: UserPasswordResetToken
  isEmailConfirmed?: boolean
  emailConfirmationToken?: UserEmailConfirmationToken
  isDeleted?: boolean
}

export default class User extends AggregateRoot<UserProps> {
  get userId(): UniqueID {
    return this.id
  }

  get email(): UserEmail {
    return this.props.email
  }

  get name(): UserName {
    return this.props.name
  }

  get password(): UserPassword {
    return this.props.password
  }

  get refreshTokens(): UserRefreshToken[] {
    return this.props.refreshTokens
  }

  get isEmailConfirmed(): boolean {
    return this.props.isEmailConfirmed
  }

  get emailConfirmationToken(): UserEmailConfirmationToken | undefined {
    return this.props.emailConfirmationToken
  }

  get passwordResetToken(): UserPasswordResetToken | undefined {
    return this.props.passwordResetToken
  }

  get isDeleted(): boolean {
    return this.props.isDeleted
  }

  isRefreshTokenValid(token: string): boolean {
    if (!this.props.refreshTokens) return false

    return this.props.refreshTokens?.some(refreshToken => refreshToken.isTokenValid(token))
  }

  createRefreshToken(): ErrorOr<UserRefreshToken> {
    const { userId } = this
    const newRefreshTokenOrError = UserRefreshToken.create({ userId })
    if (newRefreshTokenOrError.isFailure()) return Result.fail(newRefreshTokenOrError.error)

    const newRefreshToken = newRefreshTokenOrError.value
    this.refreshTokens.push(newRefreshToken)

    return Result.ok(newRefreshToken)
  }

  removeRefreshToken(tokenToRemove: UserRefreshToken): ErrorOr<void> {
    const index = this.refreshTokens.findIndex(refreshToken => refreshToken.hashedToken === tokenToRemove.hashedToken)
    if (index === -1) return Result.fail()

    this.refreshTokens.splice(index, 1)
    return Result.ok()
  }

  generatePasswordResetToken(): ErrorOr<UserPasswordResetToken> {
    const passwordResetTokenOrError = UserPasswordResetToken.create()
    if (passwordResetTokenOrError.isFailure()) return Result.fail(passwordResetTokenOrError.error)

    const passwordResetToken = passwordResetTokenOrError.value
    this.props.passwordResetToken = passwordResetToken

    this.addDomainEvent(new PasswordResetTokenCreatedEvent(this))

    return Result.ok(passwordResetToken)
  }

  destroyPasswordResetToken(): void {
    this.props.passwordResetToken = undefined
  }

  generateEmailConfirmationToken(): ErrorOr<UserEmailConfirmationToken> {
    const emailConfirmationTokenOrError = UserPasswordResetToken.create()
    if (emailConfirmationTokenOrError.isFailure()) return Result.fail(emailConfirmationTokenOrError.error)

    const emailConfirmationToken = emailConfirmationTokenOrError.value
    this.props.emailConfirmationToken = emailConfirmationToken

    return Result.ok(emailConfirmationToken)
  }

  confirmEmail(): ErrorOr {
    this.props.emailConfirmationToken = undefined
    this.props.isEmailConfirmed = true

    return Result.ok()
  }

  setPassword(password: string): ErrorOr<void> {
    const newPasswordOrError = UserPassword.create({ password })
    if (newPasswordOrError.isFailure()) return Result.fail(newPasswordOrError.error)

    this.props.password = newPasswordOrError.value

    this.addDomainEvent(new PasswordChangedEvent(this))

    return Result.ok()
  }

  private constructor(props: UserProps, id?: UniqueID) {
    super(props, id)
  }

  static create(props: UserProps, id?: UniqueID): ErrorOr<User> {
    const guardResult = Guard.againstNullOrUndefinedBulk([
      { argument: props.email, argumentName: 'email' },
      { argument: props.name, argumentName: 'name' },
      { argument: props.password, argumentName: 'password' },
    ])

    if (!guardResult.isSuccess) return Result.fail(new AppError.UndefinedArgumentError(guardResult.message))

    const user = new User(
      {
        ...props,
        refreshTokens: props.refreshTokens || [],
        isEmailConfirmed: props.isEmailConfirmed ?? false,
        isDeleted: props.isDeleted ?? false,
      },
      id
    )

    const isNewUser = !id
    if (isNewUser) user.addDomainEvent(new UserCreatedEvent(user))

    return Result.ok(user)
  }
}

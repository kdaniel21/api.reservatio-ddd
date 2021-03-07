import UserEmail from './UserEmail'
import UserName from './UserName'
import UserPassword from './UserPassword'
import AggregateRoot from '@shared/domain/AggregateRoot'
import UniqueID from '@shared/domain/UniqueID'
import { ErrorOr } from '@shared/core/DomainError'
import { Guard } from '@shared/core/Guard'
import { Result } from '@shared/core/Result'
import UserPasswordResetToken from './UserPasswordResetToken'
import { AppError } from '@shared/core/AppError'
import UserRefreshToken from './UserRefreshToken'
import UserCreatedEvent from './events/UserCreatedEvent'
import { RefreshTokenDto } from '../DTOs/RefreshTokenDto'
import PasswordResetTokenCreatedEvent from './events/PasswordResetTokenCreatedEvent'

interface UserProps {
  email: UserEmail
  name: UserName
  password: UserPassword
  refreshTokens?: UserRefreshToken[]
  passwordResetToken?: UserPasswordResetToken
  isAdmin?: boolean
  isEmailConfirmed?: boolean
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

  get isAdmin(): boolean {
    return this.props.isAdmin || false
  }

  get isEmailConfirmed(): boolean {
    return this.props.isEmailConfirmed as boolean
  }

  get passwordResetToken(): UserPasswordResetToken | undefined {
    return this.props.passwordResetToken
  }

  get isDeleted(): boolean {
    return this.props.isDeleted as boolean
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

  removeRefreshToken(tokenToRemove: RefreshTokenDto): ErrorOr<void> {
    const index = this.refreshTokens.findIndex(
      refreshToken => refreshToken.token === tokenToRemove
    )
    if (index === -1) return Result.fail()

    this.refreshTokens.splice(index, 1)
    return Result.ok()
  }

  generatePasswordResetToken(): ErrorOr<UserPasswordResetToken> {
    const passwordResetTokenOrError = UserPasswordResetToken.create()
    if (passwordResetTokenOrError.isFailure())
      return Result.fail(passwordResetTokenOrError.error)

    const passwordResetToken = passwordResetTokenOrError.value
    this.props.passwordResetToken = passwordResetToken

    this.addDomainEvent(new PasswordResetTokenCreatedEvent(this))

    return Result.ok(passwordResetToken)
  }

  setPassword(password: string): ErrorOr<void> {
    const newPasswordOrError = UserPassword.create({ password })
    if (newPasswordOrError.isFailure()) return Result.fail(newPasswordOrError.error)

    this.props.password = newPasswordOrError.value

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

    if (!guardResult.isSuccess)
      return Result.fail(new AppError.UndefinedArgumentError(guardResult.message as string))

    const user = new User(
      {
        ...props,
        refreshTokens: props.refreshTokens || [],
        isEmailConfirmed: props.isEmailConfirmed || false,
        isAdmin: props.isAdmin || false,
        isDeleted: props.isDeleted || false,
      },
      id
    )

    const isNewUser = !id
    if (isNewUser) user.addDomainEvent(new UserCreatedEvent(user))

    return Result.ok(user)
  }
}

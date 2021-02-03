import UserEmail from './UserEmail'
import UserName from './UserName'
import UserPassword from './UserPassword'
import { RefreshToken } from './tokens'
import AggregateRoot from '@shared/domain/AggregateRoot'
import UniqueID from '@shared/domain/UniqueID'
import { DomainError, ErrorOr } from '@shared/core/DomainError'
import { Guard } from '@shared/core/Guard'
import { Result } from '@shared/core/Result'
import UserPasswordResetToken from './UserPasswordResetToken'

interface UserProps {
  email: UserEmail
  name: UserName
  password: UserPassword
  refreshTokens?: RefreshToken[]
  isAdmin: boolean
  isEmailConfirmed?: boolean
  passwordResetToken?: UserPasswordResetToken | undefined
  isDeleted?: boolean
}

export class MissingArgumentError extends DomainError {
  constructor(error: string) {
    super({ message: error })
  }
}

export default class User extends AggregateRoot<UserProps> {
  get userId(): string {
    return this.id.toValue() as string
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

  get refreshTokens(): RefreshToken[] {
    return this.props.refreshTokens as RefreshToken[]
  }

  get isAdmin(): boolean {
    return this.props.isAdmin
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
      return Result.fail(new MissingArgumentError(guardResult.message as string))

    const isNewUser = !!id
    const user = new User({
      ...props,
      refreshTokens: props.refreshTokens || [],
      isEmailConfirmed: props.isEmailConfirmed || false,
      isAdmin: props.isAdmin || false,
      isDeleted: props.isDeleted || false,
    })

    // TODO: Emit new user event
    // if (isNewUser)

    return Result.ok(user)
  }
}

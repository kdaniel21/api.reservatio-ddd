import config from '@config'
import { ErrorOr } from '@shared/core/DomainError'
import { Result } from '@shared/core/Result'
import { TokenEntity, TokenEntityOptions, TokenEntityProps } from '@shared/domain/TokenEntity'
import UniqueID from '@shared/domain/UniqueID'
import User from './User'
import UserEmail from './UserEmail'

export interface InvitationProps extends TokenEntityProps {
  createdAt: Date
  emailAddress: UserEmail
  inviter: User
  isActive: boolean
}

export class Invitation extends TokenEntity<InvitationProps> {
  static tokenOptions: TokenEntityOptions = {
    tokenLength: 30,
    expirationHours: config.auth.invitationExpirationHours,
  }

  get createdAt(): Date {
    return this.props.createdAt
  }

  get emailAddress(): UserEmail {
    return this.props.emailAddress
  }

  get inviter(): User {
    return this.props.inviter
  }

  get isValid(): boolean {
    return this.props.isActive && !this.isExpired
  }

  private constructor(props: InvitationProps, id?: UniqueID) {
    super(props, id)
  }

  static create(props: InvitationProps, id?: UniqueID): ErrorOr<Invitation> {
    const validPropsOrError = Invitation.validateProps(props, id, this.tokenOptions)

    if (validPropsOrError.isFailure()) return Result.fail(validPropsOrError.error)

    const validProps = { ...props, ...validPropsOrError.value }
    const invitation = new Invitation(validProps, id)
    return Result.ok(invitation)
  }

  deactivate(): void {
    this.props.isActive = false
  }
}

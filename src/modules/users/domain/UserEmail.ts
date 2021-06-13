import { AppError } from '@shared/core/AppError'
import { ErrorOr } from '@shared/core/DomainError'
import { Guard } from '@shared/core/Guard'
import { Result } from '@shared/core/Result'
import ValueObject from '@shared/domain/ValueObject'
import InvalidUserEmailError from './errors/InvalidUserEmailError'

interface UserEmailProps {
  email: string
}

export default class UserEmail extends ValueObject<UserEmailProps> {
  private static VALID_EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/

  get value(): string {
    return this.props.email
  }

  private constructor(props: UserEmailProps) {
    super(props)
  }

  static create(email: string): ErrorOr<UserEmail> {
    const guardResult = Guard.againstNullOrUndefined({
      argument: email,
      argumentName: 'email',
    })
    if (!guardResult.isSuccess) return Result.fail(new AppError.UndefinedArgumentError(guardResult.message))

    const isValid = this.isValidEmail(email)
    if (!isValid) return Result.fail(InvalidUserEmailError)

    const userEmail = new UserEmail({ email: this.format(email) })

    return Result.ok(userEmail)
  }

  private static isValidEmail(emailToValidate: string): boolean {
    return this.VALID_EMAIL_REGEX.test(emailToValidate)
  }

  private static format(unformattedEmail: string): string {
    return unformattedEmail.trim().toLowerCase()
  }
}

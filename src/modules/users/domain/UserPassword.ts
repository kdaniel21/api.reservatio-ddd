import bcrypt from 'bcrypt'
import config from '@config'
import { ErrorOr } from '@shared/core/DomainError'
import { Guard } from '@shared/core/Guard'
import { Result } from '@shared/core/Result'
import ValueObject from '@shared/domain/ValueObject'
import { InvalidUserPasswordError } from './errors/InvalidUserPasswordError'

interface UserPasswordProps {
  password: string
  isHashed?: boolean
}

export default class UserPassword extends ValueObject<UserPasswordProps> {
  static MIN_PASSWORD_LENGTH = 8
  static MAX_PASSWORD_LENGTH = 128
  static PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/

  get value() {
    return this.props.password
  }

  get isHashed() {
    return this.props.isHashed
  }

  private constructor(props: UserPasswordProps) {
    super(props)
  }

  static create({ password, isHashed }: UserPasswordProps): ErrorOr<UserPassword> {
    if (isHashed) return Result.ok(new UserPassword({ password, isHashed }))

    const guardArgument = { argument: password, argumentName: 'password' }

    const combinedResult = Guard.combine([
      Guard.againstNullOrUndefined(guardArgument),
      Guard.againstShorterThan(this.MIN_PASSWORD_LENGTH, guardArgument),
      Guard.againstLongerThan(this.MAX_PASSWORD_LENGTH, guardArgument),
    ])
    if (!combinedResult.isSuccess)
      return Result.fail(new InvalidUserPasswordError(combinedResult.message as string))

    if (!this.PASSWORD_REGEX.test(password)) {
      const message = 'The password must contain a mix of characters and numbers.'
      return Result.fail(new InvalidUserPasswordError(message as string))
    }

    const userPassword = new UserPassword({ password, isHashed })
    return Result.ok(userPassword)
  }

  async comparePassword(plainTextPassword: string): Promise<boolean> {
    const { password, isHashed } = this.props

    if (!isHashed) return password === plainTextPassword

    return this.bcryptCompare(plainTextPassword, password)
  }

  async getHashedValue(): Promise<string> {
    const { password, isHashed } = this.props
    if (isHashed) return password

    return this.hashPassword(password)
  }

  private bcryptCompare(plainTextPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainTextPassword, hashedPassword)
  }

  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, config.bcryptSaltRounds)
  }
}

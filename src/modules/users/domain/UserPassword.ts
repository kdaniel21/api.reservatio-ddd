import bcrypt from 'bcrypt'
import config from '@config'
import { DomainError, ErrorOr } from '@shared/core/DomainError'
import { Guard } from '@shared/core/Guard'
import { Result } from '@shared/core/Result'
import ValueObject from '@shared/domain/ValueObject'

interface UserPasswordProps {
  password: string
  isHashed?: boolean
}

export class InvalidPasswordError extends DomainError {
  constructor(error: string) {
    super({ message: error })
  }
}

export default class UserPassword extends ValueObject<UserPasswordProps> {
  static MIN_PASSWORD_LENGTH = 8
  static MAX_PASSWORD_LENGTH = 128
  static PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*d)[A-Za-zd]{8,}$/

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
    const guardArgument = { argument: password, argumentName: 'password' }

    const falsyResult = Guard.againstNullOrUndefined(guardArgument)
    let combinedResults = [falsyResult]

    if (!isHashed) {
      combinedResults = [
        ...combinedResults,
        Guard.againstShorterThan(this.MIN_PASSWORD_LENGTH, guardArgument),
        Guard.againstLongerThan(this.MAX_PASSWORD_LENGTH, guardArgument),
      ]
    }

    const combinedResult = Guard.combine(combinedResults)
    if (!combinedResult.isSuccess) {
      return Result.fail(new InvalidPasswordError(combinedResult.message as string))
    }

    if (!this.PASSWORD_REGEX.test(password)) {
      const message = 'The password must contain a mix of characters and numbers.'
      return Result.fail(new InvalidPasswordError(message as string))
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

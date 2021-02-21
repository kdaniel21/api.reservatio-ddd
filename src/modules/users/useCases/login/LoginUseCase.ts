import UseCase from '@shared/core/UseCase'
import { ErrorOr } from '@shared/core/DomainError'
import UserRepository from '@modules/users/repositories/UserRepository'
import LoginDto from './LoginDto'
import LoginResponseDto from './LoginResponseDto'
import { Result } from '@shared/core/Result'
import { LoginErrors } from './LoginErrors'

export default class LoginUseCase implements UseCase<LoginDto, LoginResponseDto> {
  constructor(private userRepo: UserRepository) {}

  async execute(request: LoginDto): Promise<ErrorOr<LoginResponseDto>> {
    const { email, password } = request
    const user = await this.userRepo.findByEmail(email)

    const isUserFound = !!user
    if (!isUserFound) return Result.fail(new LoginErrors.InvalidCredentialsError())

    const isPasswordCorrect = await user.password.comparePassword(password)
    if (!isPasswordCorrect) return Result.fail(new LoginErrors.InvalidCredentialsError())
  }
}

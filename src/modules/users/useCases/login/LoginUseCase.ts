import UseCase from '@shared/core/UseCase'
import { ErrorOr } from '@shared/core/DomainError'
import UserRepository from '@modules/users/repositories/UserRepository'
import { Result } from '@shared/core/Result'
import AuthService from '@modules/users/services/AuthService'
import LoginUseCaseDto from './DTOs/LoginUseCaseDto'
import LoginUseCaseResultDto from './DTOs/LoginUseCaseResultDto'
import { LoginErrors } from './LoginErrors'

export default class LoginUseCase extends UseCase<LoginUseCaseDto, LoginUseCaseResultDto> {
  constructor(private userRepo: UserRepository, private authService: AuthService) {
    super()
  }

  protected async executeImpl(
    request: LoginUseCaseDto
  ): Promise<ErrorOr<LoginUseCaseResultDto>> {
    const { email, password } = request
    const user = await this.userRepo.findByEmail(email)

    const isUserFound = !!user
    if (!isUserFound) return new LoginErrors.InvalidCredentialsError()

    const isPasswordCorrect = await user.password.comparePassword(password)
    if (!isPasswordCorrect) new LoginErrors.InvalidCredentialsError()

    const refreshTokenOrError = await this.authService.createRefreshToken(user)
    if (refreshTokenOrError.isFailure()) return Result.fail(refreshTokenOrError.error)

    const refreshToken = refreshTokenOrError.value
    const accessToken = this.authService.createAccessToken(user)

    await this.userRepo.save(user)

    return Result.ok({
      user,
      refreshToken,
      accessToken,
    })
  }
}

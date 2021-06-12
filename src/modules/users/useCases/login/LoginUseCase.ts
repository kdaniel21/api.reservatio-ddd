import UseCase from '@shared/core/UseCase'
import { PromiseErrorOr } from '@shared/core/DomainError'
import { Result } from '@shared/core/Result'
import AuthService from '@modules/users/services/AuthService/AuthService'
import LoginUseCaseDto from './DTOs/LoginUseCaseDto'
import LoginUseCaseResultDto from './DTOs/LoginUseCaseResultDto'
import { LoginErrors } from './LoginErrors'
import UserRepository from '@modules/users/repositories/UserRepository/UserRepository'

export default class LoginUseCase extends UseCase<LoginUseCaseDto, LoginUseCaseResultDto> {
  constructor(private userRepo: UserRepository, private authService: AuthService) {
    super()
  }

  protected async executeImpl(request: LoginUseCaseDto): PromiseErrorOr<LoginUseCaseResultDto> {
    const { email, password } = request
    const userOrError = await this.userRepo.findByEmail(email)
    if (userOrError.isFailure()) return Result.fail(userOrError.error || LoginErrors.InvalidCredentialsError)

    const user = userOrError.value
    const isUserFound = !!user
    if (!isUserFound) return Result.fail(LoginErrors.InvalidCredentialsError)

    const isPasswordCorrect = await user.password.comparePassword(password)
    if (!isPasswordCorrect) return Result.fail(LoginErrors.InvalidCredentialsError)

    const { isEmailConfirmed } = user
    if (!isEmailConfirmed) return Result.fail(LoginErrors.EmailAddressNotConfirmedError)

    const refreshTokenOrError = await this.authService.createRefreshToken(user)
    if (refreshTokenOrError.isFailure()) return Result.fail(refreshTokenOrError.error)

    const refreshToken = refreshTokenOrError.value
    const accessToken = this.authService.createAccessToken(user)

    const saveResult = await this.userRepo.save(user)
    if (saveResult.isFailure()) return Result.fail(saveResult.error)

    return Result.ok({
      user,
      refreshToken,
      accessToken,
    })
  }
}

import UseCase from '@shared/core/UseCase'
import { ErrorOr } from '@shared/core/DomainError'
import UserRepository from '@modules/users/repositories/UserRepository'
import LoginDto from './DTOs/LoginDto'
import LoginResponseDto from './DTOs/LoginResponseDto'
import { Result } from '@shared/core/Result'
import { LoginErrors } from './LoginErrors'
import AuthService from '@modules/users/services/AuthService'

export default class LoginUseCase extends UseCase<LoginDto, LoginResponseDto> {
  constructor(private userRepo: UserRepository, private authService: AuthService) {
    super()
  }

  protected async executeImpl(request: LoginDto): Promise<ErrorOr<LoginResponseDto>> {
    const { email, password } = request
    const user = await this.userRepo.findByEmail(email)

    const isUserFound = !!user
    if (!isUserFound) return Result.fail(new LoginErrors.InvalidCredentialsError())

    const isPasswordCorrect = await user.password.comparePassword(password)
    if (!isPasswordCorrect) return Result.fail(new LoginErrors.InvalidCredentialsError())

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

import UseCase from '@shared/core/UseCase'
import { ErrorOr } from '@shared/core/DomainError'
import UserRepository from '@modules/users/repositories/UserRepository'
import LoginDto from './LoginDto'
import LoginResponseDto from './LoginResponseDto'
import { Result } from '@shared/core/Result'
import { LoginErrors } from './LoginErrors'
import UserMapper from '@modules/users/mappers/UserMapper'
import RefreshTokenMapper from '@modules/users/mappers/RefreshTokenMapper'
import { AppError } from '@shared/core/AppError'

export default class LoginUseCase extends UseCase<LoginDto, LoginResponseDto> {
  constructor(private userRepo: UserRepository) {
    super()
  }

  async executeImpl(request: LoginDto): Promise<ErrorOr<LoginResponseDto>> {
    const { email, password } = request
    const user = await this.userRepo.findByEmail(email)

    const isUserFound = !!user
    if (!isUserFound) return Result.fail(new LoginErrors.InvalidCredentialsError())

    const isPasswordCorrect = await user.password.comparePassword(password)
    if (!isPasswordCorrect) return Result.fail(new LoginErrors.InvalidCredentialsError())

    const refreshTokenOrError = user.createRefreshToken()
    if (refreshTokenOrError.isFailure()) return Result.fail(refreshTokenOrError.error)

    const accessToken = 'foo bar'

    await this.userRepo.save(user)

    return Result.ok({
      user: UserMapper.toDto(user),
      refreshToken: RefreshTokenMapper.toDto(refreshTokenOrError.value),
      accessToken,
    })
  }
}

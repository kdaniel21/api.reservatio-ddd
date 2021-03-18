import { JwtPayload, JwtToken } from '@modules/users/domain/AccessToken'
import AuthService from '@modules/users/services/AuthService'
import { ErrorOr } from '@shared/core/DomainError'
import { Result } from '@shared/core/Result'
import UseCase from '@shared/core/UseCase'
import CreateUserUseCase from '../createUser/CreateUserUseCase'
import RegisterDto from './DTOs/RegisterUseCaseDto'
import RegisterUseCaseResultDto from './DTOs/RegisterUseCaseResultDto'

export default class RegisterUseCase extends UseCase<RegisterDto, RegisterUseCaseResultDto> {
  constructor(
    private createUserUseCase: CreateUserUseCase,
    private authService: AuthService<JwtToken, JwtPayload>
  ) {
    super()
  }

  protected async executeImpl(
    
    request: RegisterDto
  
  ): Promise<ErrorOr<RegisterUseCaseResultDto>> {
    const newUserOrError = await this.createUserUseCase.execute(request)
    if (newUserOrError.isFailure()) return Result.fail(newUserOrError.error)

    const newUser = newUserOrError.value.user

    const refreshTokenOrError = await this.authService.createRefreshToken(newUser)
    if (refreshTokenOrError.isFailure()) return Result.fail(refreshTokenOrError.error)

    const refreshToken = refreshTokenOrError.value
    const accessToken = this.authService.createAccessToken(newUser)

    return Result.ok({
      accessToken,
      refreshToken,
      user: newUser,
    })
  }
}

import UserRepository from '@modules/users/repositories/UserRepository'
import AuthService from '@modules/users/services/AuthService'
import { PromiseErrorOr } from '@shared/core/DomainError'
import { Result } from '@shared/core/Result'
import UseCase from '@shared/core/UseCase'
import RefreshAccessTokenUseCaseDto from './DTOs/RefreshAccessTokenUseCaseDto'
import { RefreshAccessTokenErrors } from './RefreshAccessTokenErrors'
import RefreshAccessTokenUseCaseResultDto from './DTOs/RefreshAccessTokenUseCaseResultDto'

export default class RefreshAccessTokenUseCase extends UseCase<
  RefreshAccessTokenUseCaseDto,
  RefreshAccessTokenUseCaseResultDto
> {
  constructor(private userRepo: UserRepository, private authService: AuthService) {
    super()
  }

  protected async executeImpl(
    request: RefreshAccessTokenUseCaseDto
  ): PromiseErrorOr<RefreshAccessTokenUseCaseResultDto> {
    const { refreshToken } = request

    const userOrError = await this.userRepo.findByRefreshToken(refreshToken)
    if (userOrError.isFailure())
      return Result.fail(userOrError.error || RefreshAccessTokenErrors.InvalidRefreshTokenError)

    const user = userOrError.value

    const isRefreshTokenValid = user.isRefreshTokenValid(refreshToken)
    if (!isRefreshTokenValid) return Result.fail(RefreshAccessTokenErrors.InvalidRefreshTokenError)

    const newAccessToken = this.authService.createAccessToken(user)

    return Result.ok({ accessToken: newAccessToken })
  }
}

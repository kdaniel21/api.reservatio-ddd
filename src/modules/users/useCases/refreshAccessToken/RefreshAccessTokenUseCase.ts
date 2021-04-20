import User from '@modules/users/domain/User'
import UserRepository from '@modules/users/repositories/UserRepository'
import AuthService from '@modules/users/services/AuthService'
import { ErrorOr } from '@shared/core/DomainError'
import { Result } from '@shared/core/Result'
import UseCase from '@shared/core/UseCase'
import RefreshAccessTokenDto from './DTOs/RefreshAccessTokenDto'
import RefreshAccessTokenResponseDto from './DTOs/RefreshAccessTokenResponseDto'
import { RefreshAccessTokenErrors } from './RefreshAccessTokenErrors'

export default class RefreshAccessTokenUseCase extends UseCase<
  RefreshAccessTokenDto,
  RefreshAccessTokenResponseDto
> {
  constructor(private userRepo: UserRepository, private authService: AuthService) {
    super()
  }

  protected async executeImpl(
    request: RefreshAccessTokenDto
  ): Promise<ErrorOr<RefreshAccessTokenResponseDto>> {
    const { accessToken, refreshToken } = request

    let user: User

    const canReuseAccessToken = !!accessToken
    if (canReuseAccessToken) {
      const accessTokenPayloadOrError = this.authService.decodeAccessToken(accessToken)
      if (accessTokenPayloadOrError.isFailure()) return Result.fail()

      user = await this.userRepo.findOne({ id: accessTokenPayloadOrError.value.userId })
    }

    if (!user) user = await this.userRepo.findByRefreshToken(refreshToken)

    if (!user) return new RefreshAccessTokenErrors.InvalidRefreshTokenError()

    const isRefreshTokenValid = user.isRefreshTokenValid(refreshToken)
    if (!isRefreshTokenValid)
      return new RefreshAccessTokenErrors.InvalidRefreshTokenError()

    const newAccessToken = this.authService.createAccessToken(user)

    return Result.ok({ accessToken: newAccessToken })
  }
}

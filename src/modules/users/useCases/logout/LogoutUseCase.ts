import UserRepository from '@modules/users/repositories/UserRepository'
import AuthService from '@modules/users/services/AuthService'
import { PrismaUser } from '@prisma/client'
import { ErrorOr } from '@shared/core/DomainError'
import { Result } from '@shared/core/Result'
import UseCase from '@shared/core/UseCase'
import LogoutDto from './DTOs/LogoutDto'
import { LogoutErrors } from './LogoutErrors'

export default class LogoutUseCase extends UseCase<LogoutDto, void> {
  constructor(private userRepo: UserRepository<PrismaUser>, private authService: AuthService) {
    super()
  }

  async executeImpl(request: LogoutDto): Promise<ErrorOr<void>> {
    const user = await this.userRepo.findOne(
      { id: request.user.userId.toString() },
      { refreshTokens: true }
    )

    const refreshToken = user.refreshTokens.find(refreshToken =>
      refreshToken.isTokenValid(request.token)
    )
    if (!refreshToken) return Result.fail(new LogoutErrors.InvalidRefreshTokenError())

    const removeResult = await this.authService.removeRefreshToken(refreshToken, user)

    return removeResult
  }
}

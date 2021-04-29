import UserRepository from '@modules/users/repositories/UserRepository'
import AuthService from '@modules/users/services/AuthService/AuthService'
import { PrismaUser } from '@prisma/client'
import { PromiseErrorOr } from '@shared/core/DomainError'
import { Result } from '@shared/core/Result'
import UseCase from '@shared/core/UseCase'
import UniqueID from '@shared/domain/UniqueID'
import LogoutUseCaseDto from './DTOs/LogoutUseCaseDto'
import { LogoutErrors } from './LogoutErrors'

export default class LogoutUseCase extends UseCase<LogoutUseCaseDto, void> {
  constructor(private userRepo: UserRepository<PrismaUser>, private authService: AuthService) {
    super()
  }

  async executeImpl(request: LogoutUseCaseDto): PromiseErrorOr {
    const userId = new UniqueID(request.user.userId)

    const userOrError = await this.userRepo.findById(userId, { refreshTokens: true })
    if (userOrError.isFailure()) return Result.fail(userOrError.error)

    const user = userOrError.value
    const refreshToken = user.refreshTokens.find(refreshToken => refreshToken.isTokenValid(request.token))
    if (!refreshToken) return Result.fail(LogoutErrors.InvalidRefreshTokenError)

    const removeResult = await this.authService.removeRefreshToken(refreshToken, user)

    return removeResult
  }
}

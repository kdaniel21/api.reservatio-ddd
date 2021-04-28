import { JwtPayload, JwtToken } from '@modules/users/domain/AccessToken'
import User from '@modules/users/domain/User'
import jwt from 'jsonwebtoken'
import config from '@config'
import { Result } from '@shared/core/Result'
import InvalidAccessTokenError from '@modules/users/domain/errors/InvalidAccessTokenError'
import { ErrorOr, PromiseErrorOr } from '@shared/core/DomainError'
import RefreshTokenRepository from '@modules/users/repositories/RefreshTokenRepository'
import UserRefreshToken from '@modules/users/domain/UserRefreshToken'
import AuthService from './AuthService'

export default class JwtAuthService implements AuthService<JwtToken, JwtPayload> {
  constructor(private refreshTokenRepo: RefreshTokenRepository) {}

  createAccessToken(user: User): JwtToken {
    const payload: JwtPayload = {
      email: user.email.value,
      role: user.role,
      userId: user.userId.toString(),
    }

    return jwt.sign(payload, config.auth.jwtSecretKey, {
      expiresIn: config.auth.jwtExpiration,
    })
  }

  decodeAccessToken(token: JwtToken): ErrorOr<JwtPayload> {
    try {
      const payload: JwtPayload = jwt.verify(token, config.auth.jwtSecretKey) as JwtPayload

      return Result.ok(payload)
    } catch {
      return Result.fail(InvalidAccessTokenError)
    }
  }

  async createRefreshToken(user: User): PromiseErrorOr<UserRefreshToken> {
    const refreshTokenOrError = user.createRefreshToken()
    if (refreshTokenOrError.isFailure()) return Result.fail(refreshTokenOrError.error)

    const refreshToken = refreshTokenOrError.value
    await this.refreshTokenRepo.save(refreshToken)

    return Result.ok(refreshToken)
  }

  async removeRefreshToken(refreshToken: UserRefreshToken, user: User): PromiseErrorOr {
    const result = user.removeRefreshToken(refreshToken.token)
    if (result.isFailure()) return Result.fail()

    await this.refreshTokenRepo.deleteOne(refreshToken)
    return Result.ok()
  }
}

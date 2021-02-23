import { JwtPayload, JwtToken } from '@modules/users/domain/AccessToken'
import User from '@modules/users/domain/User'
import AuthService from '../AuthService'
import jwt from 'jsonwebtoken'
import config from '@config'
import { Result } from '@shared/core/Result'
import InvalidAccessTokenError from '@modules/users/domain/errors/InvalidAccessTokenError'
import { ErrorOr } from '@shared/core/DomainError'

export default class JwtAuthService implements AuthService<JwtToken, JwtPayload> {
  createAccessToken(user: User): JwtToken {
    const payload: JwtPayload = {
      email: user.email.value,
      isAdmin: user.isAdmin,
      userId: user.userId.toString(),
    }

    return jwt.sign(payload, config.auth.jwtSecretKey, {
      expiresIn: config.auth.jwtExpiration,
    })
  }

  decodeAccessToken(token: JwtToken): ErrorOr<JwtPayload> {
    const payload: JwtPayload = jwt.verify(token, config.auth.jwtSecretKey) as JwtPayload

    return payload ? Result.ok(payload) : Result.fail(new InvalidAccessTokenError())
  }
}

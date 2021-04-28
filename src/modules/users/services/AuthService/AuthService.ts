import { ErrorOr, PromiseErrorOr } from '@shared/core/DomainError'
import { JwtPayload, JwtToken } from '../../domain/AccessToken'
import User from '../../domain/User'
import UserRefreshToken from '../../domain/UserRefreshToken'

export default interface AuthService<Token = JwtToken, Payload = JwtPayload> {
  createAccessToken(user: User): Token
  decodeAccessToken(token: Token): ErrorOr<Payload>
  createRefreshToken(user: User): PromiseErrorOr<UserRefreshToken>
  removeRefreshToken(refreshToken: UserRefreshToken, User: User): PromiseErrorOr
}

import { ErrorOr } from '@shared/core/DomainError'
import { JwtPayload, JwtToken } from '../domain/AccessToken'
import User from '../domain/User'
import UserRefreshToken from '../domain/UserRefreshToken'

export default interface AuthService<Token = JwtToken, Payload = JwtPayload> {
  createAccessToken(user: User): Token
  decodeAccessToken(token: Token): ErrorOr<Payload>
  createRefreshToken(user: User): Promise<ErrorOr<UserRefreshToken>>
}

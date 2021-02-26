import { ErrorOr } from '@shared/core/DomainError'
import User from '../domain/User'
import UserRefreshToken from '../domain/UserRefreshToken'

export default interface AuthService<Token, Payload> {
  createAccessToken(user: User): Token
  decodeAccessToken(token: Token, user: User): ErrorOr<Payload>
  createRefreshToken(user: User): Promise<ErrorOr<UserRefreshToken>>
}

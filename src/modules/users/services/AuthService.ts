import { ErrorOr } from '@shared/core/DomainError'
import { JwtToken } from '../domain/AccessToken'
import User from '../domain/User'

export default interface AuthService<Token, Payload> {
  createAccessToken(user: User): Promise<Token> | Token
  decodeAccessToken(token: Token, user: User): ErrorOr<Promise<Payload>> | ErrorOr<Payload>
}

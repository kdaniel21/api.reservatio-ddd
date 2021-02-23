import { JwtToken } from '../domain/AccessToken'
import User from '../domain/User'
import UserRefreshToken from '../domain/UserRefreshToken'

export default interface AuthService {
  createAccessToken(user: User): Promise<JwtToken>
  verifyAccessToken(token: JwtToken, user: User): Promise<boolean> | boolean
  createRefreshToken(user: User): Promise<UserRefreshToken> | UserRefreshToken
  verifyRefreshToken(token: UserRefreshToken, user: User): Promise<boolean>
}

import { JwtToken } from '@modules/users/domain/AccessToken'
import User from '@modules/users/domain/User'
import UserRefreshToken from '@modules/users/domain/UserRefreshToken'

export default interface LoginResultDto {
  user: User
  accessToken: JwtToken
  refreshToken: UserRefreshToken
}

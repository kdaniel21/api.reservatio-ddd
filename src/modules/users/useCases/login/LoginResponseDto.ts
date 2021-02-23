import { JwtToken } from '@modules/users/domain/AccessToken'
import User from '@modules/users/domain/User'
import UserRefreshToken from '@modules/users/domain/UserRefreshToken'
import { RefreshTokenDto } from '@modules/users/DTOs/RefreshTokenDto'
import UserDto from '@modules/users/DTOs/UserDto'

export default interface LoginDto {
  user: UserDto
  accessToken: JwtToken
  refreshToken: RefreshTokenDto
}

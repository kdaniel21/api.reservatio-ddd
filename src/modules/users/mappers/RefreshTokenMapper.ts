import BaseMapper from '@shared/infra/BaseMapper'
import UserRefreshToken from '../domain/UserRefreshToken'
import { RefreshTokenDto } from '../DTOs/RefreshTokenDto'

export default class RefreshTokenMapper implements BaseMapper<UserRefreshToken> {
  static toDto(refreshToken: UserRefreshToken): RefreshTokenDto {
    return refreshToken.token
  }
}

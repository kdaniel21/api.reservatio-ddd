import BaseMapper from '@shared/infra/BaseMapper'
import UserRefreshToken from '../domain/UserRefreshToken'
import { RefreshTokenDto } from '../DTOs/RefreshTokenDto'

export default class RefreshTokenMapper implements BaseMapper<UserRefreshToken> {
  static toDto(refreshToken: UserRefreshToken): RefreshTokenDto {
    return refreshToken.token
  }

  static toObject(refreshToken: UserRefreshToken) {
    return {
      id: refreshToken.id.toString(),
      token: refreshToken.getHashedValue(),
      expiresAt: refreshToken.expiresAt,
      userId: refreshToken.userId.toString(),
    }
  }
}

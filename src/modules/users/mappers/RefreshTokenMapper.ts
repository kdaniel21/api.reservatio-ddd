import UniqueID from '@shared/domain/UniqueID'
import BaseMapper from '@shared/infra/BaseMapper'
import logger from '@shared/infra/Logger/logger'
import UserRefreshToken from '../domain/UserRefreshToken'
import { RefreshTokenDto } from '../DTOs/RefreshTokenDto'

export default class RefreshTokenMapper implements BaseMapper<UserRefreshToken> {
  static toDto(refreshToken: UserRefreshToken): RefreshTokenDto {
    return refreshToken.token
  }

  static toObject(refreshToken: UserRefreshToken) {
    return {
      id: refreshToken.id.toString(),
      token: refreshToken.hashedToken,
      expiresAt: refreshToken.expiresAt,
      userId: refreshToken.userId.toString(),
    }
  }

  static toDomain(raw: any): UserRefreshToken {
    const refreshTokenOrError = UserRefreshToken.create(
      {
        userId: raw.userId,
        expiresAt: raw.expiresAt,
        token: raw.token,
      },
      new UniqueID(raw.id)
    )

    if (refreshTokenOrError.isFailure()) {
      logger.error('[Domain] Error while mapping refresh token.')
      throw new Error()
    }

    return refreshTokenOrError.value
  }
}

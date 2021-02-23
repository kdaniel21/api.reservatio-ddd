import UserRefreshToken from '@modules/users/domain/UserRefreshToken'
import RefreshTokenMapper from '@modules/users/mappers/RefreshTokenMapper'
import { PrismaClient, PrismaRefreshToken } from '@prisma/client'
import RefreshTokenRepository from '../RefreshTokenRepository'

export default class PrismaRefreshTokenRepository
  implements RefreshTokenRepository<PrismaRefreshToken> {
  constructor(private prisma: PrismaClient) {}

  async save(refreshToken: UserRefreshToken): Promise<void> {
    const refreshTokenObject = RefreshTokenMapper.toObject(refreshToken)

    await this.prisma.prismaRefreshToken.upsert({
      create: refreshTokenObject,
      update: refreshTokenObject,
      where: { id: refreshToken.id.toString() },
    })
  }
}

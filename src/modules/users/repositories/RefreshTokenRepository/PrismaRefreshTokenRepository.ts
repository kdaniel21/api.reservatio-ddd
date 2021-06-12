import UserRefreshToken from '@modules/users/domain/UserRefreshToken'
import RefreshTokenMapper from '@modules/users/mappers/RefreshTokenMapper'
import { PrismaClient, PrismaRefreshToken } from '@prisma/client'
import { PromiseErrorOr } from '@shared/core/DomainError'
import { Result } from '@shared/core/Result'
import logger from '@shared/infra/Logger/logger'
import RefreshTokenRepository from './RefreshTokenRepository'

export default class PrismaRefreshTokenRepository implements RefreshTokenRepository<PrismaRefreshToken> {
  constructor(private prisma: PrismaClient) {}

  async save(refreshToken: UserRefreshToken): PromiseErrorOr {
    try {
      const refreshTokenObject = RefreshTokenMapper.toObject(refreshToken)

      await this.prisma.prismaRefreshToken.upsert({
        create: refreshTokenObject,
        update: refreshTokenObject,
        where: { id: refreshToken.id.toString() },
      })
      return Result.ok()
    } catch (err) {
      logger.error(err)

      return Result.fail()
    }
  }

  async deleteOne(refreshToken: UserRefreshToken): PromiseErrorOr {
    try {
      await this.prisma.prismaRefreshToken.delete({ where: { id: refreshToken.id.toString() } })

      return Result.ok()
    } catch (err) {
      logger.error(err)

      return Result.fail()
    }
  }
}

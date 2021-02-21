import { EntityManager, EntityRepository } from '@mikro-orm/core'
import MikroRefreshTokenEntity from '@modules/users/infra/database/MikroORM/entities/MikroRefreshTokenEntity'
import RefreshTokenRepository from '../RefreshTokenRepository'
import UserRefreshToken from '@modules/users/domain/UserRefreshToken'

export default class MikroRefreshTokenRepository
  extends EntityRepository<MikroRefreshTokenEntity>
  implements RefreshTokenRepository {
  constructor(entityManager: EntityManager) {
    super(entityManager, MikroRefreshTokenEntity)
  }

  async save() {}

  toOrmEntity(refreshToken: UserRefreshToken): MikroRefreshTokenEntity {
    return new MikroRefreshTokenEntity({
      id: refreshToken.id,
      userId: refreshToken.userId.toString(),
      token: refreshToken.token,
      expiresAt: refreshToken.expiresAt,
    })
  }
}
import { EntityManager, wrap } from '@mikro-orm/core'
import MikroRefreshTokenEntity from '@modules/users/infra/database/MikroORM/entities/MikroRefreshTokenEntity'
import RefreshTokenRepository from '../RefreshTokenRepository'
import UserRefreshToken from '@modules/users/domain/UserRefreshToken'

export default class MikroRefreshTokenRepository
  implements RefreshTokenRepository<MikroRefreshTokenEntity> {
  constructor(private em: EntityManager) {}

  async save(): Promise<any> {}

  async findOne(): Promise<any> {}

  async findMany(): Promise<any> {}

  toOrmEntity(refreshToken: UserRefreshToken): MikroRefreshTokenEntity {
    return wrap(new MikroRefreshTokenEntity()).assign(
      {
        id: refreshToken.id.toString(),
        userId: refreshToken.userId.toString(),
        token: refreshToken.token,
        expiresAt: refreshToken.expiresAt,
      },
      { em: this.em }
    )
  }
}

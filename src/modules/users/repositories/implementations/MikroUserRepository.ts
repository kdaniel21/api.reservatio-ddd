import { EntityManager, EntityRepository, Repository } from '@mikro-orm/core'
import User from '@modules/users/domain/User'
import MikroRefreshTokenEntity from '@modules/users/infra/database/MikroORM/entities/MikroRefreshTokenEntity'
import MikroUserEntity from '@modules/users/infra/database/MikroORM/entities/MikroUserEntity'
import UserRepository from '../UserRepository'

@Repository(MikroUserEntity)
export default class MikroUserRepository
  extends EntityRepository<MikroUserEntity>
  implements UserRepository {
  constructor(entityManager: EntityManager) {
    super(entityManager, MikroUserEntity)
  }

  async existsByEmail(email: string): Promise<boolean> {
    const count = await this.count({ email })

    return !!count
  }

  async save(user: User): Promise<void> {
    const mikroUser = await this.toOrmEntity(user)
    
    await this.em.persistAndFlush(mikroUser)
  }

  async toOrmEntity(user: User): Promise<MikroUserEntity> {
    const { isAdmin, isDeleted, isEmailConfirmed } = user
    const password = user.password.isHashed
      ? user.password.value
      : await user.password.getHashedValue()

    let passwordResetToken
    if (user.passwordResetToken) {
      passwordResetToken = user.passwordResetToken.isHashed
        ? user.passwordResetToken.token
        : user.passwordResetToken.getHashedValue()
    }

    const refreshTokens = user.refreshTokens.map(refreshToken => {
      return new MikroRefreshTokenEntity({
        id: refreshToken.id.toString(),
        token: refreshToken.isHashed ? refreshToken.token : refreshToken.getHashedValue(),
        expiresAt: refreshToken.expiresAt,
        userId: user.userId.toString(),
      })
    })

    return new MikroUserEntity({
      id: user.userId.toString(),
      name: user.name.value,
      email: user.email.value,
      isAdmin,
      isDeleted,
      isEmailConfirmed,
      password,
      passwordResetToken,
      passwordResetTokenExpiresAt: user.passwordResetToken?.expiresAt,
      refreshTokens,
    })
  }
}

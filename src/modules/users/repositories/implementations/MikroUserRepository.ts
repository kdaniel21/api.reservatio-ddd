import { EntityManager, EntityRepository, Repository } from '@mikro-orm/core'
import User from '@modules/users/domain/User'
import MikroRefreshTokenEntity from '@modules/users/infra/database/MikroORM/entities/MikroRefreshToken'
import MikroUserEntity from '@modules/users/infra/database/MikroORM/entities/MikroUserEntity'
import UserRepository from '../UserRepository'

@Repository(MikroUserEntity)
export default class MikroUserRepository
  extends EntityRepository<MikroUserEntity>
  implements UserRepository {
  constructor(entityManager: EntityManager) {
    super(entityManager, 'MikroUserEntity')
  }

  async existsByEmail(email: string): Promise<boolean> {
    const count = await this.count({ email })

    return !!count
  }

  async save(user: User): Promise<User> {
    console.log('saving')
    try {
      const mikroUser = await this.toOrmEntity(user)
    } catch (err) {
      console.log(err)
    }
    // await this.em.persistAndFlush(mikroUser)

    return user
  }

  async toOrmEntity(user: User): Promise<MikroUserEntity> {
    const { isAdmin, isDeleted, isEmailConfirmed } = user
    const password = user.password.isHashed
      ? user.password.value
      : await user.password.getHashedValue()

    console.log(user.refreshTokens)

    const refreshTokens = user.refreshTokens.map(refreshToken =>
      this.em.create<MikroRefreshTokenEntity>('MikroRefreshToken', {
        token: refreshToken.token,
        expiresAt: refreshToken.expiresAt,
        userId: user.userId,
      })
    )

    return this.em.create<MikroUserEntity>('MikroUserEntity', {
      id: user.userId,
      name: user.name.value,
      email: user.email.value,
      isAdmin,
      isDeleted,
      isEmailConfirmed,
      password,
      passwordResetToken: user.passwordResetToken?.token,
      passwordResetTokenExpiresAt: user.passwordResetToken?.expiresAt,
      refreshTokens,
    })
  }
}

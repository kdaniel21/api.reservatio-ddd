import { Collection, EntityManager, wrap } from '@mikro-orm/core'
import User from '@modules/users/domain/User'
import MikroRefreshTokenEntity from '@modules/users/infra/database/MikroORM/entities/MikroRefreshTokenEntity'
import MikroUserEntity from '@modules/users/infra/database/MikroORM/entities/MikroUserEntity'
import UserMapper from '@modules/users/mappers/UserMapper'
import RefreshTokenRepository from '../RefreshTokenRepository'
import UserRepository from '../UserRepository'

export default class MikroUserRepository implements UserRepository<MikroUserEntity> {
  constructor(
    private em: EntityManager,
    private refreshTokenRepo: RefreshTokenRepository<MikroRefreshTokenEntity>
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.findOne({ email })
  }

  async findMany(where: Partial<MikroUserEntity>): Promise<User[]> {
    const users = await this.em.find(MikroUserEntity, where)

    return users.map(mikroUser => UserMapper.toDomain(mikroUser))
  }

  async findOne(where: Partial<MikroUserEntity>): Promise<User | null> {
    const user = await this.em.findOne(MikroUserEntity, where)
    if (!user) return null

    return UserMapper.toDomain(user)
  }

  async existsByEmail(email: string): Promise<boolean> {
    const count = await this.em.count(MikroUserEntity, { email })

    return !!count
  }

  async save(user: User): Promise<void> {
    const mikroUser = await this.toOrmEntity(user)

    await this.em.persistAndFlush(mikroUser)
  }

  async toOrmEntity(user: User): Promise<MikroUserEntity> {
    const { isAdmin, isDeleted, isEmailConfirmed } = user

    let passwordResetToken
    if (user.passwordResetToken)
      passwordResetToken = user.passwordResetToken.isHashed
        ? user.passwordResetToken.token
        : user.passwordResetToken.getHashedValue()

    const refreshTokens = user.refreshTokens.map(refreshToken =>
      this.refreshTokenRepo.toOrmEntity(refreshToken)
    )

    return this.em.create(
      MikroUserEntity,
      {
        id: user.userId.toString(),
        name: user.name.value,
        email: user.email.value,
        isAdmin: true,
        isDeleted,
        isEmailConfirmed,
        password: await user.password.getHashedValue(),
        passwordResetToken: 'foobar',
        passwordResetTokenExpiresAt: user.passwordResetToken?.expiresAt,
        refreshTokens,
      },
      { managed: false }
    )

    // refreshTokens.forEach(token => mikroUser.refreshTokens.add(token))

    // return mikroUser
  }
}

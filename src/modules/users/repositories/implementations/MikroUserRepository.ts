import { EntityManager, EntityRepository, Repository } from '@mikro-orm/core'
import User from '@modules/users/domain/User'
import MikroUserEntity from '@modules/users/infra/database/MikroORM/entities/MikroUserEntity'
import UserMapper from '@modules/users/mappers/UserMapper'
import UserRepository from '../UserRepository'

// TODO: Add entity
@Repository(MikroUserEntity)
export default class MikroUserRepository
  extends EntityRepository<MikroUserEntity>
  implements UserRepository {
  constructor(em: EntityManager) {
    super(em, 'MikroUserEntity')
  }

  async existsByEmail(email: string): Promise<boolean> {
    const count = this.findAndCount({ email })

    return !!count
  }

  async save(user: User): Promise<User> {
    const mikroUser = await UserMapper.toMikroEntity(user, this.em)
    await this.em.persistAndFlush(mikroUser)

    return user
  }
}

import { EntityManager, EntityRepository, Repository } from '@mikro-orm/core'
import User from '@modules/users/domain/User'
import UserRepository from '../UserRepository'

// TODO: Add entity
@Repository()
export default class MikroUserRepository
  extends EntityRepository<User>
  implements UserRepository {
  constructor(private em: EntityManager, private entity: MikroUserEntity) {
    super(em, entity)
  }

  async existsByEmail(email: string): Promise<boolean> {}

  async save(user: User): Promise<User> {
    return user
  }
}

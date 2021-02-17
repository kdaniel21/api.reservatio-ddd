import User from '@modules/users/domain/User'
import UserRepository from '../UserRepository'

export default class MikroUserRepository implements UserRepository {
  async existsByEmail(email: string): Promise<boolean> {
    return false
  }

  async save(user: User): Promise<User> {
    return user
  }
}

import BaseRepository from '@shared/infra/database/BaseRepository'
import User from '../domain/User'

export default interface UserRepository<OrmE = any> extends BaseRepository<User, OrmE> {
  existsByEmail(email: string): Promise<boolean>
  findByEmail(email: string): Promise<User | null>
}

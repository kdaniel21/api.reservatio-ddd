import BaseRepository from '@shared/infra/database/BaseRepository'

export default interface UserRepository<OrmE = any> extends BaseRepository<User, OrmE> {
  existsByEmail(email: string): Promise<boolean>
  findByEmail(email: string): Promise<User | null>
}

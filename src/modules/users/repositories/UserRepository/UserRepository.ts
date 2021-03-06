import User from '@modules/users/domain/User'
import { PromiseErrorOr } from '@shared/core/DomainError'
import BaseRepository from '@shared/infra/database/BaseRepository'

export default interface UserRepository<OrmE = any> extends BaseRepository<User, OrmE> {
  existsByEmail(email: string): PromiseErrorOr<boolean>
  findByEmail(email: string): PromiseErrorOr<User>
  findByRefreshToken(token: string): PromiseErrorOr<User>
}

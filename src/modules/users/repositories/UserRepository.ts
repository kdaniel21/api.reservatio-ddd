import BaseRepository from '@shared/infra/database/BaseRepository'

export default interface UserRepository extends BaseRepository {
  existsByEmail(email: string): Promise<boolean>
}

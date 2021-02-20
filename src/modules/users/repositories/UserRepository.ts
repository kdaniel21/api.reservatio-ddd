import BaseRepository from '@shared/infra/BaseRepository'

export default interface UserRepository extends BaseRepository {
  existsByEmail(email: string): Promise<boolean>
}

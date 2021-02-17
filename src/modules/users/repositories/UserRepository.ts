import User from '../domain/User'

export default interface UserRepository {
  existsByEmail(email: string): Promise<boolean>
  save(user: User): Promise<User>
}

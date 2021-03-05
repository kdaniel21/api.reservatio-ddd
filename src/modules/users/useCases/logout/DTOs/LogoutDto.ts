import User from '@modules/users/domain/User'

export default interface LogoutDto {
  user: User
  token: string
}

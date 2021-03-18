import UserRole from '../domain/UserRole'

export default interface UserDto {
  name: string
  email: string
  isEmailConfirmed: boolean
  role: UserRole
}

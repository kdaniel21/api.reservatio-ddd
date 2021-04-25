import UserRole from '../domain/UserRole'

export default interface UserDto {
  id: string
  name: string
  email: string
  isEmailConfirmed: boolean
  role: UserRole
}

import UserDto from '@modules/users/DTOs/UserDto'

export default interface LoginDto {
  user: UserDto
  accessToken: string
  refreshToken: string
}

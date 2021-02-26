import UserDto from '@modules/users/DTOs/UserDto'

export default interface LoginControllerDto {
  user: UserDto
  accessToken: string
  refreshToken: string
}

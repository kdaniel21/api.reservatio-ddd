import UserDto from '@modules/users/DTOs/UserDto'

export default interface RegisterControllerDto {
  user: UserDto
  accessToken: string
  refreshToken: string
}

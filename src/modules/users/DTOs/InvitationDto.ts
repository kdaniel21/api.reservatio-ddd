import UserDto from './UserDto'

export default interface InvitationDto {
  id: string
  createdAt: Date
  emailAddress: string
  inviter: UserDto
  isActive: boolean
  expiresAt: Date
}

import { JwtPayload } from '@modules/users/domain/AccessToken'

export default interface CreateInvitationUseCaseDto {
  emailAddress: string
  redactedUser: JwtPayload
}

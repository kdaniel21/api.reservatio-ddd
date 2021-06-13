import { JwtPayload } from '@modules/users/domain/AccessToken'

export default interface AuthorizedUseCaseDto {
  redactedUser: JwtPayload
}

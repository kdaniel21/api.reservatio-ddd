import { JwtPayload } from '@modules/users/domain/AccessToken'

export default interface LogoutDto {
  user: JwtPayload
  token: string
}

import { JwtPayload } from '@modules/users/domain/AccessToken'
import { RefreshTokenDto } from '@modules/users/DTOs/RefreshTokenDto'

export default interface LogoutUseCaseDto {
  user: JwtPayload
  token: RefreshTokenDto
}

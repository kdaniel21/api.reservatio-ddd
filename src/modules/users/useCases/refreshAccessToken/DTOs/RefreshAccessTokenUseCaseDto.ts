import { JwtToken } from '@modules/users/domain/AccessToken'
import { RefreshTokenDto } from '@modules/users/DTOs/RefreshTokenDto'

export default interface RefreshAccessTokenUseCaseDto {
  accessToken?: JwtToken
  refreshToken: RefreshTokenDto
}

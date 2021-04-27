import { RefreshTokenDto } from '@modules/users/DTOs/RefreshTokenDto'

export default interface RefreshAccessTokenUseCaseDto {
  refreshToken: RefreshTokenDto
}

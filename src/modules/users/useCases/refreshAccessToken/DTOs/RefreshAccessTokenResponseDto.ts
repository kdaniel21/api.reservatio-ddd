import { JwtToken } from '@modules/users/domain/AccessToken'

export default interface RefreshAccessTokenResponseDto {
  accessToken: JwtToken
}

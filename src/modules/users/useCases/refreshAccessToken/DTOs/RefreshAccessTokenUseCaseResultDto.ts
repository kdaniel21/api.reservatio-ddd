import { JwtToken } from '@modules/users/domain/AccessToken'

export default interface RefreshAccessTokenUseCaseResultDto {
  accessToken: JwtToken
}

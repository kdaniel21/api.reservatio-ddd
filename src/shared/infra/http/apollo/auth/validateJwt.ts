import { JwtPayload } from '@modules/users/domain/AccessToken'
import { authService } from '@modules/users/services'
import logger from '@shared/infra/Logger/logger'
import InvalidOrMissingAccessTokenError from './InvalidOrMissingAccessToken'

export default (accessToken: string): JwtPayload => {
  const jwtPayloadOrError = authService.decodeAccessToken(accessToken)
  if (jwtPayloadOrError.isFailure()) throw new InvalidOrMissingAccessTokenError()

  const jwtPayload = jwtPayloadOrError.value

  logger.info('[Apollo] Request JWT token is authenticated.')

  return jwtPayload
}

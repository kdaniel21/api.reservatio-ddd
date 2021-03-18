import { JwtPayload } from '@modules/users/domain/AccessToken'
import { authService } from '@modules/users/services'
import logger from '@shared/infra/Logger/logger'
import InvalidOrMissingAccessTokenError from '../../koa/middleware/errors/InvalidOrMissingAccessTokenError'
import getJwtTokenFromRequest from './getJwtTokenFromRequest'

export default (req: any): JwtPayload => {
  const jwtTokenOrError = getJwtTokenFromRequest(req)
  if (jwtTokenOrError.isFailure()) throw new InvalidOrMissingAccessTokenError()

  const jwtToken = jwtTokenOrError.value
  const jwtPayloadOrError = authService.decodeAccessToken(jwtToken)
  if (jwtPayloadOrError.isFailure()) throw new InvalidOrMissingAccessTokenError()

  const jwtPayload = jwtPayloadOrError.value

  logger.info('[Koa API] Request JWT token is authenticated.')

  return jwtPayload
}

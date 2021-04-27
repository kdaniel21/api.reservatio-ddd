import { JwtPayload } from '@modules/users/domain/AccessToken'
import logger from '@shared/infra/Logger/logger'
import validateJwt from './validateJwt'
import getJwtTokenFromRequest from './getJwtTokenFromRequest'
import Koa from 'koa'

export default (request: Koa.Request): JwtPayload => {
  try {
    const accessTokenOrError = getJwtTokenFromRequest(request)
    if (accessTokenOrError.isFailure()) throw new Error()

    const payload = validateJwt(accessTokenOrError.value)
    return payload
  } catch {
    logger.info('[Apollo] Request is not authenticated.')
  }
}

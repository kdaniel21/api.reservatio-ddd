import express from 'express'
import { JwtPayload } from '@modules/users/domain/AccessToken'
import { authService } from '@modules/users/services'
import logger from '@shared/infra/Logger/logger'
import getJwtTokenFromRequest from './getJwtTokenFromRequest'
import InvalidOrMissingAccessTokenError from './InvalidOrMissingAccessToken'

export default (request: express.Request): JwtPayload => {
  const jwtTokenOrError = getJwtTokenFromRequest(request)
  if (jwtTokenOrError.isFailure()) throw new InvalidOrMissingAccessTokenError()

  const jwtToken = jwtTokenOrError.value
  const jwtPayloadOrError = authService.decodeAccessToken(jwtToken)
  if (jwtPayloadOrError.isFailure()) throw new InvalidOrMissingAccessTokenError()

  const jwtPayload = jwtPayloadOrError.value

  logger.info('[Apollo] Request JWT token is authenticated.')

  return jwtPayload
}

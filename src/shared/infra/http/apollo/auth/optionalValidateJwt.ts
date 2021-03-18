import express from 'express'
import { JwtPayload } from '@modules/users/domain/AccessToken'
import logger from '@shared/infra/Logger/logger'
import validateJwt from './validateJwt'

export default (request: express.Request ): JwtPayload => {
  try {
    const payload = validateJwt(request)

    return payload
  } catch {
    logger.info('[Koa API] Request is not authenticated.')
  }
}

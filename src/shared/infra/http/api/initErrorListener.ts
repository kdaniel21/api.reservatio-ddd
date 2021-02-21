import logger from '@shared/infra/Logger/logger'
import Koa from 'koa'

export default (app: Koa) => {
  app.on('error', (err: any, ctx: Koa.Context) => {
    logger.error(`[Koa API]: Unhandled error!`, err, ctx)
  })

  logger.info('[Koa API] Error listener has started!')
}

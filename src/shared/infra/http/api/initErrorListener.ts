import logger from '@shared/infra/Logger/logger'
import Koa from 'koa'

export default (app: Koa) => {
  app.on('error', (err: any, ctx: Koa.Context) => {
    logger.error(`[KOA API]: Unhandled error!`, err, ctx)
  })
}

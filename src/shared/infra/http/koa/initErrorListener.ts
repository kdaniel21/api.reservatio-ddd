import logger from '@shared/infra/Logger/logger'
import Koa from 'koa'
import KoaContext from './KoaContext'

export default (app: Koa) => {
  app.on('error', (err: any, ctx: KoaContext) => {
    logger.error(`[KOA API]: Unhandled error!`, err, ctx)
  })

  logger.info('[KOA API] Error listener has started!')
}

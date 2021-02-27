import logger from '@shared/infra/Logger/logger'
import Koa from 'koa'
import KoaContext from './KoaContext'
import KoaError from './KoaError'

export default (app: Koa) => {
  app.on('error', (err: KoaError, ctx: KoaContext) => {
    logger.error(`[KOA API]: Unhandled error!`, err, ctx)
    ctx.status = err.statusCode || 500
    ctx.body = {
      status: ctx.status < 500 ? 'fail' : 'error',
      message: err.message,
    }
  })

  logger.info('[Koa API] Error listener has started!')
}

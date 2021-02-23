import Koa from 'koa'
import bodyParser from 'koa-bodyparser'
import helmet from 'koa-helmet'
import cors from '@koa/cors'
import morgan from 'koa-morgan'
import logger from '@shared/infra/Logger/logger'
import initErrorListener from './initErrorListener'
import v1Router from './v1Router'

export default (): Koa => {
  const app = new Koa()

  app
    .use(bodyParser())
    .use(helmet())
    .use(cors())
    .use(morgan('dev'))
    .use(v1Router.routes())
    .use(v1Router.allowedMethods())

  // TODO: Use environment variables - JSON vs POJO vs .env
  const port = 3000
  app.listen(port).on('listening', () => {
    logger.info(`[KOA API]: Server is listening on port ${port}`)
  })

  initErrorListener(app)

  return app
}

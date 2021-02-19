import Koa from 'koa'
import bodyParser from 'koa-bodyparser'
import helmet from 'koa-helmet'
import cors from '@koa/cors'
import v1Router from './v1Router'
import { MikroORM, RequestContext } from '@mikro-orm/core'
import logger from '@shared/infra/Logger/logger'
import initErrorListener from './initErrorListener'

export default (orm: MikroORM): Koa => {
  const app = new Koa()

  app
    .use(bodyParser())
    .use(helmet())
    .use(cors())
    .use((ctx: Koa.Context, next: Koa.Next) => RequestContext.createAsync(orm.em, next))
    .use(v1Router.routes())

  initErrorListener(app)

  app.listen(4000, () => logger.info(`Server is listening on port 3000`))

  return app
}

import Koa from 'koa'
import bodyParser from 'koa-bodyparser'
import helmet from 'koa-helmet'
import cors from '@koa/cors'
import v1Router from './v1'
import { MikroORM, RequestContext } from '@mikro-orm/core'

export default (orm: MikroORM) => {
  const app = new Koa()

  app
    .use(bodyParser())
    .use(helmet())
    .use(cors())
    .use((ctx: Koa.Context, next: Koa.Next) => RequestContext.createAsync(orm.em, next))
    .use(v1Router.routes())

  return app
}

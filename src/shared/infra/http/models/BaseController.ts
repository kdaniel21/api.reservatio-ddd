import logger from '@shared/infra/Logger/logger'
import Koa from 'koa'

export default abstract class BaseController {
  protected abstract executeImpl(ctx: Koa.Context): Promise<any> | any

  constructor() {}

  async execute(ctx: Koa.Context): Promise<void> {
    try {
      await this.executeImpl(ctx)
    } catch (err) {
      logger.error(`[Koa API - BaseController]: Uncaught controller error - ${err}`)
      this.fail()
    }
  }

  protected ok<T>(ctx: Koa.Context, dto?: T): void {
    ctx.body = { ...dto }
  }

  protected fail() {}

  protected error() {}
}

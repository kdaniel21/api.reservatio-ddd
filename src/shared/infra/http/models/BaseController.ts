import Koa from 'koa'
import logger from '@shared/infra/Logger/logger'

export default abstract class BaseController {
  protected abstract executeImpl(ctx: Koa.Context): Promise<any> | any

  constructor() {}

  async execute(ctx: Koa.Context): Promise<void> {
    try {
      await this.executeImpl(ctx)
    } catch (err) {
      logger.error(`[Koa API - BaseController] Uncaught controller error - ${err}`)
      this.fail(ctx)
    }
  }

  protected ok<T>(ctx: Koa.Context, dto?: T): void {
    ctx.body = {
      status: 'success',
      data: { ...dto },
    }
    ctx.status = 200
  }

  protected fail(
    ctx: Koa.Context,
    errorDetails: { message?: string; code?: string } = {}
  ): void {
    ctx.status = 400
    ctx.body = { status: 'fail', ...errorDetails }
  }

  protected error(ctx: Koa.Context): void {
    ctx.status = 500
    ctx.body = { status: 'error' }
  }
}

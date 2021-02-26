import Koa from 'koa'
import logger from '@shared/infra/Logger/logger'

export default abstract class BaseController<ResponseDto = any> {
  protected abstract executeImpl(ctx: Koa.Context): Promise<any> | any

  constructor() {}

  async execute(ctx: Koa.Context): Promise<void> {
    try {
      await this.executeImpl(ctx)
    } catch (err) {
      logger.error(`[KOA API - BaseController]: Uncaught controller error - ${err}`)
      this.error(ctx)
    }
  }

  protected ok(ctx: Koa.Context, dto?: ResponseDto): void {
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

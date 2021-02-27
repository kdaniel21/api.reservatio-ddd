import Joi from 'joi'
import logger from '@shared/infra/Logger/logger'
import KoaContext from './koa/KoaContext'

export default abstract class BaseController<ResponseDto = any> {
  protected abstract executeImpl(ctx: KoaContext): Promise<any> | any

  protected validationSchema: Joi.Schema = Joi.object()

  constructor() {}

  async execute(ctx: KoaContext): Promise<void> {
    try {
      const validatedBodyOrError = this.validationSchema.validate(ctx.request.body)
      const isBodyValid = !validatedBodyOrError.error

      if (!isBodyValid) {
        const { message } = validatedBodyOrError.error
        return this.fail(ctx, { message, code: 'INVALID_REQUEST' })
      }

      await this.executeImpl(ctx)
    } catch (err) {
      logger.error(`[KOA API - BaseController]: Uncaught controller error - ${err}`)
      logger.error(err.stack)
      this.error(ctx)
    }
  }

  protected ok(ctx: KoaContext, dto?: ResponseDto): void {
    ctx.body = {
      status: 'success',
      data: { ...dto },
    }
    ctx.status = 200
  }

  protected fail(
    ctx: KoaContext,
    errorDetails: { message?: string; code?: string } = {}
  ): void {
    ctx.status = 400
    ctx.body = { status: 'fail', ...errorDetails }
  }

  protected error(ctx: KoaContext): void {
    ctx.status = 500
    ctx.body = { status: 'error' }
  }
}

import KoaContext from '../KoaContext'

export default abstract class BaseMiddleware {
  constructor() {}

  protected fail(
    ctx: KoaContext,
    errorDetails: { message?: string; code?: string } = {}
  ): void {
    ctx.status = 400
    ctx.body = { status: 'fail', ...errorDetails }
  }
}

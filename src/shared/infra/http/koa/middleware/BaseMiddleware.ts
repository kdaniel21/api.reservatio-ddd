import KoaContext from '../KoaContext'

export default abstract class BaseMiddleware {
  constructor() {}

  protected fail(
    ctx: KoaContext,
    errorDetails: { message?: string; code?: string; statusCode?: number } = {}
  ): void {
    const { statusCode, ...errorMessage } = errorDetails
    ctx.status = statusCode || 400
    ctx.body = { status: 'fail', ...errorMessage }
  }
}

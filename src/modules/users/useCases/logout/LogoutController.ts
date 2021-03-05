import User from '@modules/users/domain/User'
import BaseController from '@shared/infra/http/BaseController'
import KoaContext from '@shared/infra/http/koa/KoaContext'
import LogoutDto from './DTOs/LogoutDto'
import { LogoutErrors } from './LogoutErrors'
import LogoutUseCase from './LogoutUseCase'

export default class LogoutController extends BaseController<void> {
  constructor(private useCase: LogoutUseCase) {
    super()
  }

  async executeImpl(ctx: KoaContext): Promise<void> {
    const refreshToken = ctx.request.body.refreshToken || ctx.cookies.get('refreshToken')
    console.log(ctx.request.body)
    if (!refreshToken) return this.fail(ctx, new LogoutErrors.InvalidRefreshTokenError().error)

    const requestDto: LogoutDto = {
      token: refreshToken,
      user: ctx.state.auth as User,
    }
    const result = await this.useCase.execute(requestDto)

    if (!result.isFailure()) return this.ok(ctx)

    this.fail(ctx, result.error.error)
  }
}

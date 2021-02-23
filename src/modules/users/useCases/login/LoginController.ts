import Koa from 'koa'
import BaseController from '@shared/infra/http/models/BaseController'
import LoginUseCase from './LoginUseCase'
import LoginDto from './LoginDto'

export default class LoginController extends BaseController {
  constructor(private useCase: LoginUseCase) {
    super()
  }

  protected async executeImpl(ctx: Koa.Context): Promise<void> {
    const loginDto: LoginDto = ctx.request.body

    const result = await this.useCase.execute(loginDto)

    if (!result.isFailure()) return this.ok(ctx, result.value)

    this.fail(ctx, result.error.error)
  }
}

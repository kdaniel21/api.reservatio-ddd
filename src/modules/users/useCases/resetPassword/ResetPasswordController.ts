import BaseController from '@shared/infra/http/BaseController'
import KoaContext from '@shared/infra/http/koa/KoaContext'
import Joi from 'joi'
import ResetPasswordUseCase from './ResetPasswordUseCase'

export default class ResetPasswordController extends BaseController<void> {
  constructor(private useCase: ResetPasswordUseCase) {
    super()
  }

  protected validationSchema = Joi.object({
    email: Joi.string().email().required(),
  })

  async executeImpl(ctx: KoaContext): Promise<void> {
    const { email } = ctx.request.body

    await this.useCase.execute({ email })

    return this.ok(ctx, {
      message:
        'A password reset email has been sent to the email address if it is registered.',
    })
  }
}

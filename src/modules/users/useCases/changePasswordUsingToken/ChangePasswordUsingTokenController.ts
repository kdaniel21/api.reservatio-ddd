import BaseController from '@shared/infra/http/BaseController'
import KoaContext from '@shared/infra/http/koa/KoaContext'
import Joi from 'joi'
import ChangePasswordUsingTokenUseCase from './ChangePasswordUsingTokenUseCase'
import ChangePasswordUsingTokenDto from './DTOs/ChangePasswordUsingTokenDto'

export default class ChangePasswordUsingTokenController extends BaseController<void> {
  constructor(private useCase: ChangePasswordUsingTokenUseCase) {
    super()
  }

  protected validationSchema = Joi.object({
    password: Joi.string().min(8).required(),
    passwordConfirm: Joi.string()
      .equal(Joi.ref('password'))
      .required()
      .label('Password confirmation')
      .options({ messages: { 'any.only': '{{#label}} does not match!' } }),
  })

  async executeImpl(ctx: KoaContext): Promise<void> {
    const request: ChangePasswordUsingTokenDto = {
      passwordResetToken: ctx.params.passwordResetToken,
      newPassword: ctx.request.body.password,
    }

    const result = await this.useCase.execute(request)
    if (result.isFailure()) return this.fail(ctx, result.error.error)

    return this.ok(ctx, { message: 'Password has been changed successfully!' })
  }
}

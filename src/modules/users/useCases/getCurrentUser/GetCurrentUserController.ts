import Joi from 'joi'
import BaseController from '@shared/infra/http/BaseController'
import GetCurrentUserControllerDto from './DTOs/GetCurrentUserControllerDto'
import KoaContext from '@shared/infra/http/koa/KoaContext'
import UserMapper from '@modules/users/mappers/UserMapper'
import User from '@modules/users/domain/User'

export default class GetCurrentUserController extends BaseController<GetCurrentUserControllerDto> {
  constructor() {
    super()
  }

  protected validationSchema = Joi.object({
    refreshToken: Joi.string().optional(),
  })

  async executeImpl(ctx: KoaContext): Promise<void> {
    const user = ctx.state.auth as User
    const resultDto: GetCurrentUserControllerDto = { user: UserMapper.toDto(user) }

    this.ok(ctx, resultDto)
  }
}

import BaseController from '@shared/infra/http/models/BaseController'
import CreateUserDto from './CreateUserDto'
import { CreateUserError } from './CreateUserErrors'
import CreateUserUseCase from './CreateUserUseCase'
import Koa from 'koa'

export default class CreateUserController extends BaseController {
  constructor(private useCase: CreateUserUseCase) {
    super()
  }

  async executeImpl(ctx: Koa.Context) {
    let dto: CreateUserDto = ctx.request.body as CreateUserDto

    try {
      const result = await this.useCase.execute(dto)

      if (!result.isFailure()) return this.ok(ctx, result.value)

      switch (result.error.constructor) {
        case CreateUserError.EmailAlreadyExistsError:
          return this.fail(ctx, result.error.error.message)
        default:
          return this.fail(ctx, result.error.error.message)
      }
    } catch (err) {
      this.error(ctx)
    }
  }
}

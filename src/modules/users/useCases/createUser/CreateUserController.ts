import Koa from 'koa'
import BaseController from '@shared/infra/http/models/BaseController'
import CreateUserDto from './CreateUserDto'
import { CreateUserError } from './CreateUserErrors'
import CreateUserUseCase from './CreateUserUseCase'

export default class CreateUserController extends BaseController {
  constructor(private useCase: CreateUserUseCase) {
    super()
  }

  protected async executeImpl(ctx: Koa.Context): Promise<void> {
    let dto: CreateUserDto = ctx.request.body as CreateUserDto

    const result = await this.useCase.execute(dto)

    if (!result.isFailure()) return this.ok(ctx, result.value)

    const error = result.error
    switch (error.constructor) {
      case CreateUserError.EmailAlreadyExistsError:
        return this.fail(ctx, error.error)
      default:
        return this.fail(ctx, error.error)
    }
  }
}

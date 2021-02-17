import BaseController from '@shared/infra/http/models/BaseController'
import TextUtils from '@shared/utils/TextUtils'
import CreateUserDto from './CreateUserDto'
import { CreateUserError } from './CreateUserErrors'
import CreateUserUseCase from './CreateUserUseCase'
import Koa from 'koa'

export default class CreateUserController extends BaseController {
  constructor(private useCase: CreateUserUseCase) {
    super()
  }

  async executeImpl(ctx: Koa.Context) {
    let dto: CreateUserDto = ctx.body

    dto = {
      email: TextUtils.sanitize(dto.email),
      name: TextUtils.sanitize(dto.name),
      password: dto.password,
    }

    try {
      const result = await this.useCase.execute(dto)

      if (result.isSuccess()) return this.ok(result.value)

      const { error } = result
      switch (error.constructor) {
        case CreateUserError.EmailAlreadyExistsError:
          return this.fail()
        default:
          return this.error()
      }
    } catch (err) {
      this.error()
    }
  }
}

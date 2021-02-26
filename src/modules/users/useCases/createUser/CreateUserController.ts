import Koa from 'koa'
import BaseController from '@shared/infra/http/BaseController'
import CreateUserDto from './DTOs/CreateUserDto'
import { CreateUserError } from './CreateUserErrors'
import CreateUserUseCase from './CreateUserUseCase'
import UserMapper from '@modules/users/mappers/UserMapper'
import CreateUserControllerDto from './DTOs/CreateUserControllerDto'

export default class CreateUserController extends BaseController<CreateUserControllerDto> {
  constructor(private useCase: CreateUserUseCase) {
    super()
  }

  protected async executeImpl(ctx: Koa.Context): Promise<void> {
    let dto: CreateUserDto = ctx.request.body as CreateUserDto

    const result = await this.useCase.execute(dto)

    if (!result.isFailure()) {
      const resultDto: CreateUserControllerDto = {
        user: UserMapper.toDto(result.value.user),
      }

      return this.ok(ctx, resultDto)
    }

    const error = result.error
    switch (error.constructor) {
      case CreateUserError.EmailAlreadyExistsError:
        return this.fail(ctx, error.error)
      default:
        return this.fail(ctx, error.error)
    }
  }
}

import Joi from 'joi'
import BaseController from '@shared/infra/http/BaseController'
import CreateUserDto from './DTOs/CreateUserDto'
import { CreateUserError } from './CreateUserErrors'
import CreateUserUseCase from './CreateUserUseCase'
import UserMapper from '@modules/users/mappers/UserMapper'
import CreateUserControllerDto from './DTOs/CreateUserControllerDto'
import KoaContext from '@shared/infra/http/koa/KoaContext'

export default class CreateUserController extends BaseController<CreateUserControllerDto> {
  constructor(private useCase: CreateUserUseCase) {
    super()
  }

  protected validationSchema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    passwordConfirm: Joi.ref('password'),
  })

  protected async executeImpl(ctx: KoaContext): Promise<void> {
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

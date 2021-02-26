import Koa from 'koa'
import BaseController from '@shared/infra/http/models/BaseController'
import LoginUseCase from './LoginUseCase'
import LoginDto from './DTOs/LoginDto'
import RefreshTokenMapper from '@modules/users/mappers/RefreshTokenMapper'
import UserMapper from '@modules/users/mappers/UserMapper'
import LoginControllerDto from './DTOs/LoginControllerDto'

export default class LoginController extends BaseController<LoginControllerDto> {
  constructor(private useCase: LoginUseCase) {
    super()
  }

  protected async executeImpl(ctx: Koa.Context): Promise<void> {
    const loginDto: LoginDto = ctx.request.body

    const result = await this.useCase.execute(loginDto)

    if (!result.isFailure()) {
      const resultDto: LoginControllerDto = {
        accessToken: result.value.accessToken,
        refreshToken: RefreshTokenMapper.toDto(result.value.refreshToken),
        user: UserMapper.toDto(result.value.user),
      }

      this.ok(ctx, resultDto)
    }

    this.fail(ctx, result.error.error)
  }
}

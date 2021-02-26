import Koa from 'koa'
import BaseController from '@shared/infra/http/BaseController'
import RegisterControllerDto from './DTOs/RegisterControllerDto'
import RegisterUseCase from './RegisterUseCase'
import UserMapper from '@modules/users/mappers/UserMapper'
import RefreshTokenMapper from '@modules/users/mappers/RefreshTokenMapper'

export default class RegisterController extends BaseController<RegisterControllerDto> {
  constructor(private useCase: RegisterUseCase) {
    super()
  }

  async executeImpl(ctx: Koa.Context): Promise<void> {
    const result = await this.useCase.execute(ctx.request.body)

    if (!result.isFailure()) {
      const { user, refreshToken, accessToken } = result.value
      const resultDto: RegisterControllerDto = {
        user: UserMapper.toDto(user),
        refreshToken: RefreshTokenMapper.toDto(refreshToken),
        accessToken,
      }

      return this.ok(ctx, resultDto)
    }

    this.fail(ctx, result.error.error)
  }
}

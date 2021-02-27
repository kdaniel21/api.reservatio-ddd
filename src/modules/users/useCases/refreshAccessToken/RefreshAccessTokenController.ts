import BaseController from '@shared/infra/http/BaseController'
import KoaContext from '@shared/infra/http/koa/KoaContext'
import RefreshAccessTokenDto from './DTOs/RefreshAccessTokenDto'
import RefreshAccessTokenResponseDto from './DTOs/RefreshAccessTokenResponseDto'
import RefreshAccessTokenUseCase from './RefreshAccessTokenUseCase'

export default class RefreshAccessTokenController extends BaseController<RefreshAccessTokenResponseDto> {
  constructor(private useCase: RefreshAccessTokenUseCase) {
    super()
  }

  async executeImpl(ctx: KoaContext): Promise<void> {
    const requestDto: RefreshAccessTokenDto = {
      refreshToken: ctx.request.body.refreshToken || ctx.cookies.get('refreshToken'),
      accessToken: ctx.request.body.accessToken,
    }

    const result = await this.useCase.execute(requestDto)

    if (!result.isFailure()) {
      const { accessToken } = result.value
      return this.ok(ctx, { accessToken })
    }

    this.fail(ctx, result.error.error)
  }
}

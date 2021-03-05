import Joi from 'joi'
import BaseController from '@shared/infra/http/BaseController'
import KoaContext from '@shared/infra/http/koa/KoaContext'
import RefreshAccessTokenDto from './DTOs/RefreshAccessTokenDto'
import RefreshAccessTokenResponseDto from './DTOs/RefreshAccessTokenResponseDto'
import RefreshAccessTokenUseCase from './RefreshAccessTokenUseCase'
import { Guard } from '@shared/core/Guard'

export default class RefreshAccessTokenController extends BaseController<RefreshAccessTokenResponseDto> {
  constructor(private useCase: RefreshAccessTokenUseCase) {
    super()
  }

  protected validationSchema = Joi.object({
    refreshToken: Joi.string().token().optional(),
    accessToken: Joi.string().token().optional(),
  })

  async executeImpl(ctx: KoaContext): Promise<void> {
    const refreshToken = ctx.request.body.refreshToken || ctx.cookies.get('refreshToken')
    const guardResult = Guard.againstNullOrUndefined({
      argument: refreshToken,
      argumentName: 'refresh token',
    })
    if (!guardResult.isSuccess) return this.fail(ctx, guardResult)

    const requestDto: RefreshAccessTokenDto = {
      refreshToken,
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

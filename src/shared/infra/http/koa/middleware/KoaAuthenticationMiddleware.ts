import Koa from 'koa'
import { JwtPayload, JwtToken } from '@modules/users/domain/AccessToken'
import AuthService from '@modules/users/services/AuthService'
import { ErrorOr } from '@shared/core/DomainError'
import { Result } from '@shared/core/Result'
import logger from '@shared/infra/Logger/logger'

export default class KoaAuthenticationMiddleware {
  constructor(private authService: AuthService<JwtToken, JwtPayload>) {}

  async authenticate(ctx: Koa.Context, next: Koa.Next): Promise<void> {
    const jwtTokenOrError = this.getAccessJwtFromRequest(ctx.request)
    if (jwtTokenOrError.isFailure()) {
      // throw error
      return
    }

    const jwtToken = jwtTokenOrError.value
    const jwtPayload = this.authService.decodeAccessToken(jwtToken)

    logger.info('[Koa API] Request is authenticated.')
    ctx.state.auth = { ...jwtPayload }

    await next()
  }

  async optionalAuthenticate(ctx: Koa.Context, next: Koa.Next): Promise<void> {
    try {
      await this.authenticate(ctx, next)
    } catch {
      logger.info('[Koa API] Request is not authenticated.')
      await next()
    }
  }

  private getAccessJwtFromRequest(request: Koa.Request): ErrorOr<JwtToken> {
    const bearerToken: string = request.headers.authorization || request.body.accessToken
    if (!bearerToken) return Result.fail()

    const token = bearerToken.replace('Bearer', '')
    return Result.ok(token)
  }
}

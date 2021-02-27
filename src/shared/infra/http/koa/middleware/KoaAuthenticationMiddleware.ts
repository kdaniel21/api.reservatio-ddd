import Koa from 'koa'
import compose from 'koa-compose'
import { JwtPayload, JwtToken } from '@modules/users/domain/AccessToken'
import AuthService from '@modules/users/services/AuthService'
import { ErrorOr } from '@shared/core/DomainError'
import { Result } from '@shared/core/Result'
import logger from '@shared/infra/Logger/logger'
import KoaContext from '../KoaContext'
import UserRepository from '@modules/users/repositories/UserRepository'

export default class KoaAuthenticationMiddleware {
  constructor(
    private authService: AuthService<JwtToken, JwtPayload>,
    private userRepo: UserRepository
  ) {}

  async authenticate(ctx: KoaContext, next: Koa.Next): Promise<void> {
    const jwtTokenOrError = this.getAccessJwtFromRequest(ctx.request)
    if (jwtTokenOrError.isFailure()) {
      // throw error
      return
    }

    const jwtToken = jwtTokenOrError.value
    const jwtPayloadOrError = this.authService.decodeAccessToken(jwtToken)
    if (jwtPayloadOrError.isFailure()) {
      // TODO: throw error
      return
    }

    const jwtPayload = jwtPayloadOrError.value

    logger.info('[Koa API] Request is authenticated.')
    ctx.state.auth = { ...jwtPayload }

    await next()
  }

  async optionalAuthenticate(ctx: KoaContext, next: Koa.Next): Promise<void> {
    try {
      await this.authenticate(ctx, next)
    } catch {
      logger.info('[Koa API] Request is not authenticated.')
      await next()
    }
  }

  async authenticateAndFetchUser(): Promise<void> {
    await compose([this.authenticate, this.fetchUser])
  }

  async fetchUser(ctx: KoaContext, next: Koa.Next): Promise<void> {
    if (!ctx.state.auth) {
      // TODO: Throw error
      return
    }

    const { userId: id } = ctx.state.auth
    const user = await this.userRepo.findOne({ id })
    if (!user) {
      // TODO: Throw error
      return
    }

    ctx.state.auth = user
    await next()
  }

  private getAccessJwtFromRequest(request: Koa.Request): ErrorOr<JwtToken> {
    const bearerToken: string = request.headers.authorization || request.body.accessToken
    if (!bearerToken) return Result.fail()

    const token = bearerToken.replace('Bearer', '')
    return Result.ok(token)
  }
}

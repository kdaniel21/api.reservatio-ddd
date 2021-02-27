import Koa from 'koa'
import compose from 'koa-compose'
import { JwtPayload, JwtToken } from '@modules/users/domain/AccessToken'
import AuthService from '@modules/users/services/AuthService'
import { ErrorOr } from '@shared/core/DomainError'
import { Result } from '@shared/core/Result'
import logger from '@shared/infra/Logger/logger'
import KoaContext from '../KoaContext'
import UserRepository from '@modules/users/repositories/UserRepository'
import BaseMiddleware from './BaseMiddleware'
import InvalidOrMissingAccessTokenError from './errors/InvalidOrMissingAccessTokenError'

export default class KoaAuthenticationMiddleware extends BaseMiddleware {
  constructor(
    private authService: AuthService<JwtToken, JwtPayload>,
    private userRepo: UserRepository
  ) {
    super()
  }

  async validateJwt(ctx: KoaContext, next: Koa.Next): Promise<void> {
    const jwtTokenOrError = this.getAccessJwtFromRequest(ctx.request)
    if (jwtTokenOrError.isFailure()) {
      // throw error
      return this.fail(ctx, new InvalidOrMissingAccessTokenError())
    }

    const jwtToken = jwtTokenOrError.value
    const jwtPayloadOrError = this.authService.decodeAccessToken(jwtToken)
    if (jwtPayloadOrError.isFailure()) {
      return this.fail(ctx, new InvalidOrMissingAccessTokenError())
    }

    const jwtPayload = jwtPayloadOrError.value

    logger.info('[Koa API] Request is authenticated.')
    ctx.state.auth = { ...jwtPayload }

    await next()
  }

  async optionalValidateJwt(ctx: KoaContext, next: Koa.Next): Promise<void> {
    try {
      await this.validateJwt(ctx, next)
    } catch {
      logger.info('[Koa API] Request is not authenticated.')
      await next()
    }
  }

  async validateJwtAndFetchUser(ctx: KoaContext, next: Koa.Next) {
    await this.validateJwt(ctx, next)
    await this.fetchUser(ctx, next)
  }

  async fetchUser(ctx: KoaContext, next: Koa.Next): Promise<void> {
    if (!ctx.state.auth) {
      // TODO: Throw error
      return this.fail(ctx, new InvalidOrMissingAccessTokenError())
    }

    const { userId: id } = ctx.state.auth
    const user = await this.userRepo.findOne({ id })
    if (!user) {
      // TODO: Encapsulate error
      return this.fail(ctx, new InvalidOrMissingAccessTokenError())
    }

    ctx.state.auth = user
    await next()
  }

  private getAccessJwtFromRequest(request: Koa.Request): ErrorOr<JwtToken> {
    const bearerToken: string = request.headers.authorization || request.body.accessToken
    if (!bearerToken) return Result.fail()

    const token = bearerToken.replace('Bearer ', '')
    return Result.ok(token)
  }
}

import Koa from 'koa'
import Router from 'koa-router'
import KoaContext from '@shared/infra/http/koa/KoaContext'
import { getCurrentUserController } from '@modules/users/useCases/getCurrentUser'
import { loginController } from '@modules/users/useCases/login'
import { registerController } from '@modules/users/useCases/register'
import { authMiddleware } from '@shared/infra/http/koa/middleware'
import { refreshAccessTokenController } from '@modules/users/useCases/refreshAccessToken'

const authRouter = new Router()

authRouter.prefix('/auth')

authRouter.post('/login', (ctx: KoaContext) => loginController.execute(ctx))
authRouter.post('/register', (ctx: KoaContext) => registerController.execute(ctx))
authRouter.get(
  '/profile',
  (ctx: KoaContext, next: Koa.Next) => authMiddleware.validateJwtAndFetchUser(ctx, next),
  // (ctx: KoaContext, next: Koa.Next) => authMiddleware.validateJwt(ctx, next),
  // (ctx: KoaContext, next: Koa.Next) => authMiddleware.fetchUser(ctx, next),
  (ctx: KoaContext) => getCurrentUserController.execute(ctx)
)
authRouter.post('/refresh', (ctx: KoaContext) => refreshAccessTokenController.execute(ctx))

export default authRouter

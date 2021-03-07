import Router from 'koa-router'
import KoaContext from '@shared/infra/http/koa/KoaContext'
import { getCurrentUserController } from '@modules/users/useCases/getCurrentUser'
import { loginController } from '@modules/users/useCases/login'
import { registerController } from '@modules/users/useCases/register'
import { authMiddleware } from '@shared/infra/http/koa/middleware'
import { refreshAccessTokenController } from '@modules/users/useCases/refreshAccessToken'
import { logoutController } from '@modules/users/useCases/logout'
import { resetPasswordController } from '@modules/users/useCases/resetPassword'
import { changePasswordUsingTokenController } from '@modules/users/useCases/changePasswordUsingToken'

const authRouter = new Router()
authRouter.prefix('/auth')

authRouter.post('/login', (ctx: KoaContext) => loginController.execute(ctx))

authRouter.post('/register', (ctx: KoaContext) => registerController.execute(ctx))

authRouter.get('/profile', authMiddleware.validateJwtAndFetchUser(), (ctx: KoaContext) =>
  getCurrentUserController.execute(ctx)
)

authRouter.post('/refresh', (ctx: KoaContext) => refreshAccessTokenController.execute(ctx))

authRouter.post('/logout', authMiddleware.validateJwtAndFetchUser(), (ctx: KoaContext) =>
  logoutController.execute(ctx)
)

authRouter.post('/forgot-password', (ctx: KoaContext) => resetPasswordController.execute(ctx))

authRouter.post('/change-password', (ctx: KoaContext) =>
  changePasswordUsingTokenController.execute(ctx)
)

export default authRouter

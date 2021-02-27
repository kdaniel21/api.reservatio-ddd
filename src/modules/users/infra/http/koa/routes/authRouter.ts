import Router from 'koa-router'
import KoaContext from '@shared/infra/http/koa/KoaContext'
import { getCurrentUserController } from '@modules/users/useCases/getCurrentUser'
import { loginController } from '@modules/users/useCases/login'
import { registerController } from '@modules/users/useCases/register'

const authRouter = new Router()

authRouter.prefix('/auth')

authRouter.post('/login', (ctx: KoaContext) => loginController.execute(ctx))
authRouter.post('/register', (ctx: KoaContext) => registerController.execute(ctx))
authRouter.get('/profile', (ctx: KoaContext) => getCurrentUserController.execute(ctx))

export default authRouter

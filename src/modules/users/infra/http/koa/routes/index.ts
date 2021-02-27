import Router from 'koa-router'
import { createUserController } from '@modules/users/useCases/createUser'
import { loginController } from '@modules/users/useCases/login'
import { registerController } from '@modules/users/useCases/register'
import KoaContext from '@shared/infra/http/koa/KoaContext'

const usersRouter = new Router()

usersRouter.prefix('/users')

usersRouter.post('/', (ctx: KoaContext) => createUserController.execute(ctx))
usersRouter.post('/login', (ctx: KoaContext) => loginController.execute(ctx))
usersRouter.post('/register', (ctx: KoaContext) => registerController.execute(ctx))

export default usersRouter

import Koa from 'koa'
import Router from 'koa-router'
import { createUserController } from '@modules/users/useCases/createUser'
import { loginController } from '@modules/users/useCases/login'
import { registerController } from '@modules/users/useCases/register'

const usersRouter = new Router()

usersRouter.prefix('/users')

usersRouter.post('/', (ctx: Koa.Context) => createUserController.execute(ctx))
usersRouter.post('/login', (ctx: Koa.Context) => loginController.execute(ctx))
usersRouter.post('/register', (ctx: Koa.Context) => registerController.execute(ctx))

export default usersRouter

import Koa from 'koa'
import Router from 'koa-router'
import { createUserController } from '@modules/users/useCases/createUser'

const usersRouter = new Router()

usersRouter.prefix('/users')

usersRouter.post('/', (ctx: Koa.Context) => createUserController.execute(ctx))

export default usersRouter

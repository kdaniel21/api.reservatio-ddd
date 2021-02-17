import Koa from 'koa'
import Router from 'koa-router'
import { createUserController } from '@modules/users/useCases/createUser'

const usersRouter = new Router()

usersRouter.post('/', (ctx: Koa.Context) => createUserController.execute(ctx))

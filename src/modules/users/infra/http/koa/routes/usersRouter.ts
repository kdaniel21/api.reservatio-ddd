import Router from 'koa-router'
import KoaContext from '@shared/infra/http/koa/KoaContext'
import { createUserController } from '@modules/users/useCases/createUser'

const usersRouter = new Router()

usersRouter.prefix('/users')

usersRouter.post('/', (ctx: KoaContext) => createUserController.execute(ctx))

export default usersRouter

import Router from 'koa-router'
import KoaContext from '@shared/infra/http/koa/KoaContext'
import { createUserController } from '@modules/users/useCases/createUser'
import { authMiddleware } from '@shared/infra/http/koa/middleware'

const usersRouter = new Router()

usersRouter.prefix('/users')

usersRouter.post('/', authMiddleware.validateJwtFetchUserAndAdminOnly(), (ctx: KoaContext) =>
  createUserController.execute(ctx)
)

export default usersRouter

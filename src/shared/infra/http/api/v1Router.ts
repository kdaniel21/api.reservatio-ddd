import Router from 'koa-router'
import usersRouter from '@modules/users/infra/http/api/routes'

const router = new Router()

router.use(usersRouter.routes(), usersRouter.allowedMethods())

export default router

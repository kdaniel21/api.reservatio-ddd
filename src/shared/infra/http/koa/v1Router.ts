import Router from 'koa-router'
import { usersRouter, authRouter } from '@modules/users/infra/http/koa/routes'

const router = new Router()

router.prefix('/api/v1')

router.use(usersRouter.routes(), usersRouter.allowedMethods())
router.use(authRouter.routes(), usersRouter.allowedMethods())

export default router

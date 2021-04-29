import config from '@config'
import logger from '@shared/infra/Logger/logger'
import prisma from '../prisma'

if (config.isDevelopment) {
  prisma.$use(async (params, next) => {
    const startingTimestamp = Date.now()

    const result = await next(params)

    const queryTime = Date.now() - startingTimestamp
    logger.info(`[PRISMA] Database action '${params.action}' took ${queryTime} ms.`)

    return result
  })
}

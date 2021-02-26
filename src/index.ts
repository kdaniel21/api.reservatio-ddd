import logger from '@shared/infra/Logger/logger'
import initServer from '@shared/infra/http/koa/initServer'

const initApplication = async () => {
  logger.info('Starting application...')

  initServer()

  // Load subscribers
  require('@modules/users/subscribers/index')
}

initApplication()
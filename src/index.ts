import logger from '@shared/infra/Logger/logger'
import initServer from '@shared/infra/http/koa/initServer'

const initApplication = async () => {
  logger.info('Starting application...')

  initServer()

  // Load modules
  require('@modules/users')
}

initApplication()
/* eslint-disable global-require */
import { initApolloServer } from '@shared/infra/http/apollo/initApolloServer'
import logger from '@shared/infra/Logger/logger'

const initApplication = async () => {
  logger.info('Starting application...')

  await initApolloServer()

  require('@modules/users')
  require('@modules/reservation')
}

initApplication()

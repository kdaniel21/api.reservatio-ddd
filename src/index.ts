import logger from '@shared/infra/Logger/logger'
import initApolloServer from '@shared/infra/http/apollo/initApolloServer'

const initApplication = async () => {
  logger.info('Starting application...')

  await initApolloServer()

  // Load modules
  require('@modules/users')
}

initApplication()
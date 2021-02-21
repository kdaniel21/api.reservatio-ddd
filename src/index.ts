import { initDatabaseConnection } from './shared/infra/database/MikroORM/config/initDatabaseConnection'

const initApplication = async () => {
  const orm = await initDatabaseConnection()

  // Delay loading of modules that depend on the ORM
  const initServer = require('./shared/infra/http/api/initServer').default
  initServer(orm)

  // Load subscribers
  require('@modules/users/subscribers/index')
}

initApplication()
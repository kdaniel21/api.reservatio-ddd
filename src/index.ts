import initServer from './shared/infra/http/api/initServer'
import { initDatabaseConnection } from './shared/infra/database/MikroORM/config/initDatabaseConnection'

const initApplication = async () => {
  const orm = await initDatabaseConnection()

  initServer(orm)
}

initApplication()
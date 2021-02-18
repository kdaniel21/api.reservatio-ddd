import initDatabaseConnection from '@shared/infra/database/MikroORM/config/init'
import initServer from '@shared/infra/http/api/init'

const initApplication = async () => {
  const orm = await initDatabaseConnection()

  initServer(orm)
}

initApplication()

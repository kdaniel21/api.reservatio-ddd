import { EntityManager, MikroORM } from '@mikro-orm/core'
import logger from '@shared/infra/Logger/logger'

export let mikroOrmInstance: MikroORM
export let entityManager: EntityManager

export const initDatabaseConnection = async (): Promise<MikroORM> => {
  try {
    mikroOrmInstance = await MikroORM.init()
    entityManager = mikroOrmInstance.em

    logger.info('[MikroORM] Successfully connected to the DB!')

    return mikroOrmInstance
  } catch (err) {
    logger.fatal(`[MikroORM]: Fatal Error - Could not connect to the database!`, err)
    logger.fatal('Terminating application...')
    process.exit()
  }
}

import { EntityManager, MikroORM } from '@mikro-orm/core'
import logger from '@shared/infra/Logger/logger'

export let mikroOrmInstance: MikroORM
export let entityManager: EntityManager

export const initDatabaseConnection = async (): Promise<MikroORM> => {
  try {
    mikroOrmInstance = await MikroORM.init()
    const isConnected = await mikroOrmInstance.isConnected()
    if (!isConnected) throw new Error()

    logger.info('[MikroORM] Successfully connected to the DB!')
        
    entityManager = mikroOrmInstance.em
    return mikroOrmInstance
  } catch (err) {
    logger.fatal(`[MikroORM] Fatal error while connecting to the DB!`)
    logger.fatal('Terminating application...')
    process.exit()
  }
}

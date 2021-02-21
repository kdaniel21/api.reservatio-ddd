import { EntityManager, MikroORM } from '@mikro-orm/core'
import logger from '@shared/infra/Logger/logger'

export let mikroOrmInstance: MikroORM
export let entityManager: EntityManager

export const initDatabaseConnection = async (): Promise<MikroORM> => {
  mikroOrmInstance = await MikroORM.init()
  entityManager = mikroOrmInstance.em

  logger.info('[MikroORM] Successfully connected to the DB!')

  return mikroOrmInstance
}

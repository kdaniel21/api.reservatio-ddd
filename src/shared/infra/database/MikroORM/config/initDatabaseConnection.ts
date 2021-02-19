import { EntityManager, MikroORM } from '@mikro-orm/core'

export let mikroOrmInstance: MikroORM
export let entityManager: EntityManager

export const initDatabaseConnection = async (): Promise<MikroORM> => {
  mikroOrmInstance = await MikroORM.init()
  entityManager = mikroOrmInstance.em

  return mikroOrmInstance
}

import { EntityManager, MikroORM } from '@mikro-orm/core'

export let orm: MikroORM

export let entityManager: EntityManager

export const initDatabaseConnection = async (): Promise<MikroORM> => {
  orm = await MikroORM.init()
  entityManager = orm.em

  return orm
}

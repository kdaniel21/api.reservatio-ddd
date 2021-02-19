import MikroUserRepository from './implementations/MikroUserRepository'
import { entityManager } from '@shared/infra/database/MikroORM/config/initDatabaseConnection'

export const userRepository = new MikroUserRepository(entityManager)

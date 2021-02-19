import { entityManager } from '@shared/infra/database/MikroORM/config/initDatabaseConnection'
import MikroUserRepository from './implementations/MikroUserRepository'

export const userRepository = new MikroUserRepository(entityManager)

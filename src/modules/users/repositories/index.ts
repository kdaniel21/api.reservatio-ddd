import { entityManager } from '@shared/infra/database/MikroORM/config/initDatabaseConnection'
import MikroRefreshTokenRepository from './implementations/MikroRefreshTokenRepository'
import MikroUserRepository from './implementations/MikroUserRepository'

export const refreshTokenRepository = new MikroRefreshTokenRepository(entityManager)

export const userRepository = new MikroUserRepository(entityManager, refreshTokenRepository)

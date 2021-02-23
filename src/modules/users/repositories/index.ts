import { entityManager } from '@shared/infra/database/MikroORM/config/initDatabaseConnection'
import prisma from '@shared/infra/database/prisma/prisma'
import MikroRefreshTokenRepository from './implementations/MikroRefreshTokenRepository'
import PrismaRefreshTokenRepository from './implementations/PrismaRefreshTokenRepository';
import PrismaUserRepository from './implementations/PrismaUserRepository'

// export const refreshTokenRepository = new MikroRefreshTokenRepository(entityManager)

export const refreshTokenRepository = new PrismaRefreshTokenRepository(prisma)

export const userRepository = new PrismaUserRepository(prisma, refreshTokenRepository)

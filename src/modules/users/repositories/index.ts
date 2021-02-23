import prisma from '@shared/infra/database/prisma/prisma'
import PrismaRefreshTokenRepository from './implementations/PrismaRefreshTokenRepository';
import PrismaUserRepository from './implementations/PrismaUserRepository'

export const refreshTokenRepository = new PrismaRefreshTokenRepository(prisma)

export const userRepository = new PrismaUserRepository(prisma, refreshTokenRepository)

import prisma from '@shared/infra/database/prisma/prisma'
import PrismaInvitationRepository from './InvitationRepository/PrismaInvitationRepository'
import PrismaRefreshTokenRepository from './RefreshTokenRepository/PrismaRefreshTokenRepository'
import PrismaUserRepository from './UserRepository/PrismaUserRepository'

export const refreshTokenRepository = new PrismaRefreshTokenRepository(prisma)

export const userRepository = new PrismaUserRepository(prisma)

export const invitationRepository = new PrismaInvitationRepository(prisma)

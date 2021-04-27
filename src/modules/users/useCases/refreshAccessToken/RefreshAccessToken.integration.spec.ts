import 'reflect-metadata'
import '@modules/users'
import { JwtToken, JwtPayload } from '@modules/users/domain/AccessToken'
import { PrismaRefreshToken, PrismaUser } from '@prisma/client'
import UniqueID from '@shared/domain/UniqueID'
import prisma from '@shared/infra/database/prisma/prisma'
import clearAllData from '@shared/infra/database/prisma/utils/clearAllData'
import { InitializedApolloServer, initApolloServer } from '@shared/infra/http/apollo/initApolloServer'
import supertest from 'supertest'
import bcrypt from 'bcrypt'
import config from '@config'
import crypto from 'crypto'
import jwt from 'jsonwebtoken'

describe('RefreshAccessToken Integration', () => {
  let initializedServer: InitializedApolloServer
  let request: supertest.SuperTest<supertest.Test>

  let userRecord: PrismaUser
  let refreshToken: string
  let refreshTokenRecord: PrismaRefreshToken
  let accessToken: JwtToken

  beforeAll(async () => {
    initializedServer = await initApolloServer()
    request = supertest(initializedServer.serverInfo.url)
  })

  afterAll(async () => {
    await initializedServer.apolloServer.stop()
    await prisma.$disconnect()
  })

  beforeEach(async () => {
    await clearAllData()

    userRecord = await prisma.prismaUser.create({
      data: {
        id: new UniqueID().toString(),
        name: 'Foo Bar',
        email: 'foo@bar.com',
        password: await bcrypt.hash('password', config.auth.bcryptSaltRounds),
        isEmailConfirmed: true,
      },
    })

    refreshToken = crypto.randomBytes(20).toString('hex')
    refreshTokenRecord = await prisma.prismaRefreshToken.create({
      data: {
        expiresAt: new Date(Date.now() + 10 * 10 * 1000),
        id: new UniqueID().toString(),
        token: crypto.createHash('sha256').update(refreshToken).digest('hex').toString(),
        user: { connect: userRecord },
      },
    })

    accessToken = jwt.sign(
      { userId: userRecord.id, role: userRecord.role, email: userRecord.email } as JwtPayload,
      config.auth.jwtSecretKey
    )
  })

  it('should get the the refresh token from the cookies and')
})

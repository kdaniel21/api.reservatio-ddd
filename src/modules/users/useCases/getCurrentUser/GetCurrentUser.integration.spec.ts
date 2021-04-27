import 'reflect-metadata'
import '@modules/users'
import { initApolloServer, InitializedApolloServer } from '@shared/infra/http/apollo/initApolloServer'
import supertest from 'supertest'
import { PrismaUser } from '.prisma/client'
import prisma from '@shared/infra/database/prisma/prisma'
import clearAllData from '@shared/infra/database/prisma/utils/clearAllData'
import UniqueID from '@shared/domain/UniqueID'
import bcrypt from 'bcrypt'
import config from '@config'
import { JwtPayload, JwtToken } from '@modules/users/domain/AccessToken'
import jwt from 'jsonwebtoken'

describe('GetCurrentUser Integration', () => {
  let initializedServer: InitializedApolloServer
  let request: supertest.SuperTest<supertest.Test>

  let userRecord: PrismaUser
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

    accessToken = jwt.sign(
      { userId: userRecord.id, role: userRecord.role, email: userRecord.email } as JwtPayload,
      config.auth.jwtSecretKey
    )
  })

  it('should return the authenticated user', async () => {
    const query = `query {
      currentUser {
        id
        name
        email
        isEmailConfirmed
        role
      }
    }`

    const res = await request.post('/').send({ query }).set('Authorization', accessToken).expect(200)

    expect(res.body.data.currentUser.id).toBe(userRecord.id)
    expect(res.body.data.currentUser.name).toBe(userRecord.name)
    expect(res.body.data.currentUser.email).toBe(userRecord.email)
    expect(res.body.data.currentUser.isEmailConfirmed).toBe(userRecord.isEmailConfirmed)
    expect(res.body.data.currentUser.role).toBe(userRecord.role)
  })

  it('should throw an authentication error if no access token is provided', async () => {
    const query = `query {
      currentUser {
        id
        name
        email
        isEmailConfirmed
        role
      }
    }`

    const res = await request.post('/').send({ query }).expect(200)

    expect(res.body.errors[0].extensions.code).toBe('INTERNAL_SERVER_ERROR')
  })
})

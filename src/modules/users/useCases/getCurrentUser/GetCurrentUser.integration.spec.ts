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
    await clearAllData()
    await initializedServer.apolloServer.stop()
    await prisma.$disconnect()
  })

  beforeEach(async () => {
    await clearAllData()

    userRecord = await prisma.prismaUser.create({
      data: {
        id: new UniqueID().toString(),
        email: 'foo@bar.com',
        password: await bcrypt.hash('password', config.auth.bcryptSaltRounds),
        isEmailConfirmed: true,
      },
    })

    accessToken = jwt.sign({ userId: userRecord.id, email: userRecord.email } as JwtPayload, config.auth.jwtSecretKey)
  })

  it('should return the authenticated user', async () => {
    const query = `query {
      currentUser {
        id
        email
        isEmailConfirmed
      }
    }`

    const res = await request.post('/').send({ query }).set('Authorization', accessToken).expect(200)

    expect(res.body.data.currentUser.id).toBe(userRecord.id)
    expect(res.body.data.currentUser.email).toBe(userRecord.email)
    expect(res.body.data.currentUser.isEmailConfirmed).toBe(userRecord.isEmailConfirmed)
  })

  it('should return the customer profile of the user', async () => {
    const customer = await prisma.prismaCustomer.create({
      data: { id: new UniqueID().toString(), name: 'Test Name', userId: userRecord.id },
    })
    const query = `query {
      currentUser {
        id
        email
        isEmailConfirmed
        customer {
          id
          name
        }
      }
    }`

    const res = await request.post('/').send({ query }).set('Authorization', accessToken).expect(200)

    expect(res.body.data.currentUser.id).toBe(userRecord.id)
    expect(res.body.data.currentUser.customer).toBeTruthy()
    expect(res.body.data.currentUser.customer.id).toBe(customer.id)
    expect(res.body.data.currentUser.customer.name).toBe(customer.name)
  })

  it('should throw an InvalidOrMissingAccessTokenError error if no access token is provided', async () => {
    const query = `query {
      currentUser {
        id
        email
        isEmailConfirmed
      }
    }`

    const res = await request.post('/').send({ query }).expect(200)

    expect(res.body.errors[0].extensions.code).toBe('INVALID_ACCESS_TOKEN')
  })

  it('should throw a UserNotFoundError error if the access token is valid but the user does not exist', async () => {
    const validAccessToken = jwt.sign(
      {
        email: 'invalid@bar.com',
        userId: new UniqueID().toString(),
      } as JwtPayload,
      config.auth.jwtSecretKey
    )
    const query = `query {
      currentUser {
        id
        email
        isEmailConfirmed
      }
    }`

    const res = await request.post('/').send({ query }).set('Authorization', validAccessToken).expect(200)

    expect(res.body.errors[0].extensions.code).toBe('USER_NOT_FOUND')
  })

  it('should throw a InvalidOrMissingAccessToken error if an invalid access token is provided', async () => {
    const query = `query {
      currentUser {
        id
        email
        isEmailConfirmed
      }
    }`

    const res = await request.post('/').send({ query }).set('Authorization', new UniqueID().toString()).expect(200)

    expect(res.body.errors[0].extensions.code).toBe('INVALID_ACCESS_TOKEN')
  })
})

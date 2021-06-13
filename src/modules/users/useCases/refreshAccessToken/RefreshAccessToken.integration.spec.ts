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
        userId: userRecord.id,
      },
    })

    accessToken = jwt.sign({ userId: userRecord.id, email: userRecord.email } as JwtPayload, config.auth.jwtSecretKey)

    jest.clearAllMocks()
  })

  it('should get the refresh token from the cookie and return a valid access token', async () => {
    const query = `query {
      refreshAccessToken {
        accessToken
      }
    }`

    const res = await request.post('/').send({ query }).set('Cookie', `refresh-token=${refreshToken}`).expect(200)

    expect(res.body.data.refreshAccessToken.accessToken).toBeTruthy()
    const accessTokenPayload = jwt.verify(
      res.body.data.refreshAccessToken.accessToken,
      config.auth.jwtSecretKey,
    ) as JwtPayload
    expect(accessTokenPayload.email).toBe(userRecord.email)
    expect(accessTokenPayload.userId).toBe(userRecord.id)
  })

  it('should get the refresh token from the input and return a valid access token', async () => {
    const query = `query {
      refreshAccessToken(refreshToken: "${refreshToken}") {
        accessToken
      }
    }`

    const res = await request.post('/').send({ query }).expect(200)

    expect(res.body.data.refreshAccessToken.accessToken).toBeTruthy()
    const accessTokenPayload = jwt.verify(
      res.body.data.refreshAccessToken.accessToken,
      config.auth.jwtSecretKey,
    ) as JwtPayload
    expect(accessTokenPayload.email).toBe(userRecord.email)
    expect(accessTokenPayload.userId).toBe(userRecord.id)
  })

  it('should prefer the token provided via input over the one stored as a cookie', async () => {
    const expiredRefreshToken = crypto.randomBytes(20).toString('hex')
    await prisma.prismaRefreshToken.create({
      data: {
        expiresAt: new Date(Date.now() - 10 * 10 * 1000),
        id: new UniqueID().toString(),
        token: crypto.createHash('sha256').update(expiredRefreshToken).digest('hex').toString(),
        userId: userRecord.id,
      },
    })
    const query = `query {
      refreshAccessToken(refreshToken: "${refreshToken}") {
        accessToken
      }
    }`

    const res = await request
      .post('/')
      .send({ query })
      .set('Cookie', `refresh-token=${expiredRefreshToken}`)
      .expect(200)

    expect(res.body.data.refreshAccessToken.accessToken).toBeTruthy()
    const accessTokenPayload = jwt.verify(
      res.body.data.refreshAccessToken.accessToken,
      config.auth.jwtSecretKey,
    ) as JwtPayload
    expect(accessTokenPayload.email).toBe(userRecord.email)
    expect(accessTokenPayload.userId).toBe(userRecord.id)
  })

  it('should throw an InvalidRefreshTokenError error if no refresh token is provided', async () => {
    jest.spyOn(jwt as any, 'sign')
    const query = `query {
      refreshAccessToken {
        accessToken
      }
    }`

    const res = await request.post('/').send({ query }).expect(200)

    expect(res.body.errors[0].extensions.code).toBe('INVALID_REFRESH_TOKEN')
    expect(jwt.sign).not.toBeCalled()
  })

  it('should throw an InvalidRefreshTokenError error if an invalid refresh token is provided', async () => {
    jest.spyOn(jwt as any, 'sign')
    const query = `query {
      refreshAccessToken(refreshToken: "${new UniqueID().toString()}") {
        accessToken
      }
    }`

    const res = await request.post('/').send({ query }).expect(200)

    expect(res.body.errors[0].extensions.code).toBe('INVALID_REFRESH_TOKEN')
    expect(jwt.sign).not.toBeCalled()
  })

  it('should throw an InvalidRefreshTokenError error if an expired refresh token is provided via input', async () => {
    jest.spyOn(jwt as any, 'sign')
    const expiredRefreshToken = crypto.randomBytes(20).toString('hex')
    await prisma.prismaRefreshToken.create({
      data: {
        expiresAt: new Date(Date.now() - 10 * 10 * 1000),
        id: new UniqueID().toString(),
        token: crypto.createHash('sha256').update(expiredRefreshToken).digest('hex').toString(),
        userId: userRecord.id,
      },
    })
    const query = `query {
      refreshAccessToken(refreshToken: "${expiredRefreshToken}") {
        accessToken
      }
    }`

    const res = await request.post('/').send({ query }).expect(200)

    expect(res.body.errors[0].extensions.code).toBe('INVALID_REFRESH_TOKEN')
    expect(jwt.sign).not.toBeCalled()
  })

  it('should throw an InvalidRefreshTokenError error if an expired refresh token is provided via cookie', async () => {
    jest.spyOn(jwt as any, 'sign')
    const expiredRefreshToken = crypto.randomBytes(20).toString('hex')
    await prisma.prismaRefreshToken.create({
      data: {
        expiresAt: new Date(Date.now() - 10 * 10 * 1000),
        id: new UniqueID().toString(),
        token: crypto.createHash('sha256').update(expiredRefreshToken).digest('hex').toString(),
        userId: userRecord.id,
      },
    })
    const query = `query {
      refreshAccessToken {
        accessToken
      }
    }`

    const res = await request
      .post('/')
      .send({ query })
      .set('Cookie', `refresh-token=${expiredRefreshToken}`)
      .expect(200)

    expect(res.body.errors[0].extensions.code).toBe('INVALID_REFRESH_TOKEN')
    expect(jwt.sign).not.toBeCalled()
  })
})

import 'reflect-metadata'
import '@modules/users'
import { PrismaUser } from '@prisma/client'
import UniqueID from '@shared/domain/UniqueID'
import prisma from '@shared/infra/database/prisma/prisma'
import clearAllData from '@shared/infra/database/prisma/utils/clearAllData'
import { InitializedApolloServer, initApolloServer } from '@shared/infra/http/apollo/initApolloServer'
import supertest from 'supertest'
import bcrypt from 'bcrypt'
import config from '@config'
import validateJwt from '@shared/infra/http/apollo/auth/validateJwt'
import TextUtils from '@shared/utils/TextUtils'
import { extractCookies } from '@shared/testing/extractCookies'
import crypto from 'crypto'

describe('Login Integration', () => {
  let initializedServer: InitializedApolloServer
  let request: supertest.SuperTest<supertest.Test>

  let userRecord: PrismaUser

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
  })

  it('should login with the correct credentials and return the user', async () => {
    const query = `mutation {
      login(params: {
        email: "foo@bar.com",
        password: "password",
      }) {
        user {
          id
          email
        }
      }
    }`

    const res = await request.post('/').send({ query }).expect(200)

    expect(res.body.data.login.user.id).toBeTruthy()
    expect(res.body.data.login.user.email).toBe('foo@bar.com')
  })

  it('should login with the correct credentials and return a valid access token', async () => {
    const query = `mutation {
      login(params: {
        email: "foo@bar.com",
        password: "password",
      }) {
        accessToken
      }
    }`

    const res = await request.post('/').send({ query }).expect(200)

    expect(res.body.data.login.accessToken).toBeTruthy()
    const jwtPayload = validateJwt(res.body.data.login.accessToken)
    expect(jwtPayload.email).toBe('foo@bar.com')
    expect(jwtPayload.userId).toBe(userRecord.id)
  })

  it('should login with the correct credentials, generate and return a valid refresh token', async () => {
    const query = `mutation {
      login(params: {
        email: "foo@bar.com",
        password: "password",
      }) {
        refreshToken
      }
    }`

    const res = await request.post('/').send({ query }).expect(200)

    expect(res.body.data.login.refreshToken).toBeTruthy()
    const hashedToken = TextUtils.hashText(res.body.data.login.refreshToken)
    const refreshTokenRecord = await prisma.prismaRefreshToken.findUnique({
      where: { token: hashedToken },
      include: { user: true },
    })
    expect(refreshTokenRecord).toBeTruthy()
    expect(refreshTokenRecord.user.id).toBe(userRecord.id)
    expect(refreshTokenRecord.expiresAt.getTime()).toBeGreaterThan(Date.now())
  })

  it('should login with the correct credentials and set the refresh token as an http-only cookie', async () => {
    const query = `mutation {
      login(params: {
        email: "foo@bar.com",
        password: "password",
      }) {
        refreshToken
      }
    }`

    const res = await request.post('/').send({ query }).expect(200)

    const plainRefreshToken = res.body.data.login.refreshToken
    const refreshTokenRecord = await prisma.prismaRefreshToken.findFirst({ where: { user: { email: 'foo@bar.com' } } })
    const cookies = extractCookies(res.headers)
    const refreshTokenCookie = cookies[config.auth.refreshTokenCookieName]
    expect(refreshTokenCookie.value).toBe(plainRefreshToken)
    expect(refreshTokenCookie.flags['httponly']).toBeTruthy()
    const expirationThreshold = 30 * 1000
    const expectedExpiration = new Date(Date.now() + config.auth.refreshTokenExpirationHours * 60 * 60 * 1000).getTime()
    const cookieExpiration = new Date(refreshTokenCookie.flags['expires']).getTime()
    expect(cookieExpiration).toBeGreaterThan(expectedExpiration - expirationThreshold)
    expect(cookieExpiration).toBeLessThan(expectedExpiration + expirationThreshold)
    expect(crypto.createHash('sha256').update(refreshTokenCookie.value).digest('hex').toString()).toBe(
      refreshTokenRecord.token
    )
  })

  it('should throw an InvalidCredentials error if the email address is invalid', async () => {
    const query = `mutation {
      login(params: {
        email: "foo1@bar.com",
        password: "password",
      }) {
        refreshToken
      }
    }`

    const res = await request.post('/').send({ query }).expect(200)

    expect(res.body.errors[0].extensions.code).toBe('INVALID_CREDENTIALS')
    const numOfUserRefreshTokens = await prisma.prismaRefreshToken.count({ where: { userId: userRecord.id } })
    expect(numOfUserRefreshTokens).toBe(0)
  })

  it('should throw an InvalidCredentials error if the password is invalid', async () => {
    const query = `mutation {
      login(params: {
        email: "foo@bar.com",
        password: "password12",
      }) {
        refreshToken
      }
    }`

    const res = await request.post('/').send({ query }).expect(200)

    expect(res.body.errors[0].extensions.code).toBe('INVALID_CREDENTIALS')
    const numOfUserRefreshTokens = await prisma.prismaRefreshToken.count({ where: { userId: userRecord.id } })
    expect(numOfUserRefreshTokens).toBe(0)
  })

  it('should throw an EmailAddressNotConfirmedError if the email address has not been confirmed', async () => {
    await prisma.prismaUser.update({ where: { id: userRecord.id }, data: { isEmailConfirmed: false } })
    const query = `mutation {
      login(params: {
        email: "foo@bar.com",
        password: "password",
      }) {
        refreshToken
      }
    }`

    const res = await request.post('/').send({ query }).expect(200)

    expect(res.body.errors[0].extensions.code).toBe('EMAIL_NOT_VERIFIED')
    const numOfUserRefreshTokens = await prisma.prismaRefreshToken.count({ where: { userId: userRecord.id } })
    expect(numOfUserRefreshTokens).toBe(0)
  })
})

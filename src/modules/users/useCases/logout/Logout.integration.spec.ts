import 'reflect-metadata'
import '@modules/users'
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
import { JwtPayload } from '@modules/users/domain/AccessToken'
import { extractCookies } from '@shared/utils/extractCookies'
import UserRole from '@modules/users/domain/UserRole'
import JwtAuthService from '@modules/users/services/AuthService/JwtAuthService'
import { Result } from '@shared/core/Result'

describe('Logout Integration', () => {
  let initializedServer: InitializedApolloServer
  let request: supertest.SuperTest<supertest.Test>

  let userRecord: PrismaUser
  let refreshTokenRecord: PrismaRefreshToken
  let refreshToken: string
  let accessToken: string

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
        name: 'Foo Bar',
        email: 'foo@bar.com',
        password: await bcrypt.hash('password', config.auth.bcryptSaltRounds),
        isEmailConfirmed: true,
      },
    })

    refreshToken = crypto.randomBytes(20).toString('hex')
    refreshTokenRecord = await prisma.prismaRefreshToken.create({
      data: {
        id: new UniqueID().toString(),
        token: crypto.createHash('sha256').update(refreshToken).digest('hex').toString(),
        expiresAt: new Date(Date.now() + 60 * 1000),
        userId: userRecord.id,
      },
    })

    accessToken = jwt.sign(
      { userId: userRecord.id, role: userRecord.role, email: userRecord.email } as JwtPayload,
      config.auth.jwtSecretKey
    )
  })

  it('should get the refresh token from the cookie and remove it from the database', async () => {
    const query = `
      mutation {
        logout {
          message
        }
      }
    `

    const res = await request
      .post('/')
      .send({ query })
      .set('Cookie', `refresh-token=${refreshToken}`)
      .set('Authorization', accessToken)
      .expect(200)

    expect(res.body.data.logout.message).toBeTruthy()
    const numOfRefreshTokens = await prisma.prismaRefreshToken.count()
    expect(numOfRefreshTokens).toBe(0)
  })

  it('should get the refresh token from the input and remove it from the database', async () => {
    const query = `
      mutation {
        logout(refreshToken: "${refreshToken}") {
          message
        }
      }
    `

    const res = await request.post('/').send({ query }).set('Authorization', accessToken).expect(200)

    expect(res.body.data.logout.message).toBeTruthy()
    const numOfRefreshTokens = await prisma.prismaRefreshToken.count()
    expect(numOfRefreshTokens).toBe(0)
  })

  it('should prefer the refresh token in the input over the refresh token in the cookie', async () => {
    const query = `
      mutation {
        logout(refreshToken: "${refreshToken}") {
          message
        }
      }
    `

    const res = await request
      .post('/')
      .send({ query })
      .set('Cookie', `refresh-token=${new UniqueID().toString()}`)
      .set('Authorization', accessToken)
      .expect(200)

    expect(res.body.data.logout.message).toBeTruthy()
    const numOfRefreshTokens = await prisma.prismaRefreshToken.count()
    expect(numOfRefreshTokens).toBe(0)
  })

  it('should remove the refresh token cookie', async () => {
    const query = `
      mutation {
        logout {
          message
        }
      }
    `

    const res = await request
      .post('/')
      .send({ query })
      .set('Cookie', `refresh-token=${refreshToken}`)
      .set('Authorization', accessToken)
      .expect(200)

    expect(res.body.data.logout.message).toBeTruthy()
    const cookies = extractCookies(res.headers)
    expect(cookies[config.auth.refreshTokenCookieName].value).toBeFalsy()
  })

  it('should throw an InvalidRefreshTokenError if neither the input nor the cookie contains the refresh token', async () => {
    const query = `
      mutation {
        logout {
          message
        }
      }
    `

    const res = await request.post('/').send({ query }).set('Authorization', accessToken).expect(200)

    expect(res.body.errors[0].extensions.code).toBe('INVALID_REFRESH_TOKEN')
    const numOfRefreshTokens = await prisma.prismaRefreshToken.count()
    expect(numOfRefreshTokens).toBe(1)
  })

  it('should throw an InvalidOrMissingAccessTokenError if no access token is provided', async () => {
    const query = `
      mutation {
        logout {
          message
        }
      }
    `

    const res = await request
      .post('/')
      .send({ query })
      .set('Cookie', `refresh-token=${new UniqueID().toString()}`)
      .expect(200)

    expect(res.body.errors[0].extensions.code).toBe('INVALID_ACCESS_TOKEN')
  })

  it('should throw an error if the user could not be found based on the access token payload', async () => {
    const accessTokenWithInvalidUser = jwt.sign(
      {
        email: 'whatever@foo.com',
        role: UserRole.User,
        userId: new UniqueID().toString(),
      } as JwtPayload,
      config.auth.jwtSecretKey
    )
    const query = `
      mutation {
        logout {
          message
        }
      }
    `

    const res = await request
      .post('/')
      .send({ query })
      .set('Cookie', `refresh-token=${new UniqueID().toString()}`)
      .set('Authorization', accessTokenWithInvalidUser)
      .expect(200)

    expect(res.body.errors[0].extensions.code).toBe('UNEXPECTED_ERROR')
    const cookies = extractCookies(res.headers)
    const hasCookieBeenChanged = !!cookies[config.auth.refreshTokenCookieName]
    expect(hasCookieBeenChanged).toBeFalsy()
    const numOfRefreshTokens = await prisma.prismaRefreshToken.count()
    expect(numOfRefreshTokens).toBe(1)
  })

  it('should throw an error if the refresh token could not be removed', async () => {
    jest.spyOn(JwtAuthService.prototype, 'removeRefreshToken').mockResolvedValueOnce(Result.fail())
    const query = `
      mutation {
        logout {
          message
        }
      }
    `

    const res = await request
      .post('/')
      .send({ query })
      .set('Authorization', accessToken)
      .set('Cookie', `refresh-token=${refreshToken}`)
      .expect(200)

    expect(res.body.errors[0].extensions.code).toBeTruthy()
    const cookies = extractCookies(res.headers)
    const hasCookieBeenChanged = !!cookies[config.auth.refreshTokenCookieName]
    expect(hasCookieBeenChanged).toBeFalsy()
    const numOfRefreshTokens = await prisma.prismaRefreshToken.count()
    expect(numOfRefreshTokens).toBe(1)
  })
})

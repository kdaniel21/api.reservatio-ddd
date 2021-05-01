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
import crypto from 'crypto'

describe('ChangePasswordUsingToken', () => {
  let initializedServer: InitializedApolloServer
  let request: supertest.SuperTest<supertest.Test>

  let userRecord: PrismaUser
  let passwordResetToken: string

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

    passwordResetToken = crypto.randomBytes(20).toString('hex')

    userRecord = await prisma.prismaUser.create({
      data: {
        id: new UniqueID().toString(),
        email: 'foo@bar.com',
        password: await bcrypt.hash('password', config.auth.bcryptSaltRounds),
        passwordResetToken: crypto.createHash('sha256').update(passwordResetToken).digest('hex').toString(),
        passwordResetTokenExpiresAt: new Date(Date.now() + 5 * 60 * 1000),
        isEmailConfirmed: true,
      },
    })
  })

  it('should persist the new encrypted password to the database', async () => {
    const query = `mutation {
      changePasswordUsingToken(params: {
        passwordResetToken: "${passwordResetToken}",
        password: "Th1sIsAG00dPassw0rd",
        passwordConfirm: "Th1sIsAG00dPassw0rd"
      }) {
        message
      }
    }`

    const res = await request.post('/').send({ query })

    expect(res.body.data.changePasswordUsingToken.message).toBeTruthy()
    const user = await prisma.prismaUser.findUnique({ where: { id: userRecord.id } })
    expect(user.password).not.toBe(userRecord.password)
    expect(user.password).not.toBe('Th1sIsAG00dPassw0rd')
    const doPasswordsMatch = await bcrypt.compare('Th1sIsAG00dPassw0rd', user.password)
    expect(doPasswordsMatch).toBe(true)
  })

  it(`should set both 'passwordResetToken' and 'passwordResetTokenExpiresAt' to undefined in the database`, async () => {
    const query = `mutation {
      changePasswordUsingToken(params: {
        passwordResetToken: "${passwordResetToken}",
        password: "Th1sIsAG00dPassw0rd",
        passwordConfirm: "Th1sIsAG00dPassw0rd"
      }) {
        message
      }
    }`

    await request.post('/').send({ query }).expect(200)

    const user = await prisma.prismaUser.findUnique({ where: { id: userRecord.id } })
    expect(user.passwordResetToken).toBeFalsy()
    expect(user.passwordResetTokenExpiresAt).toBeFalsy()
  })

  it('should throw a validation error if the password does not meet the criteria', async () => {
    const query = `mutation {
      changePasswordUsingToken(params: {
        passwordResetToken: "${passwordResetToken}",
        password: "weakpassword",
        passwordConfirm: "weakpassword"
      }) {
        message
      }
    }`

    const res = await request.post('/').send({ query }).expect(200)

    expect(res.body.errors[0].extensions.code).toBe('VALIDATION_ERROR')
    const user = await prisma.prismaUser.findUnique({ where: { id: userRecord.id } })
    expect(user.password).toBe(userRecord.password)
    expect(user.passwordResetToken).toBeTruthy()
    expect(user.passwordResetTokenExpiresAt).toBeTruthy()
  })

  it(`should throw a validation error if the 'password' and 'passwordConfirm' do not match`, async () => {
    const query = `mutation {
      changePasswordUsingToken(params: {
        passwordResetToken: "${passwordResetToken}",
        password: "weakpassword",
        passwordConfirm: "differentpassword"
      }) {
        message
      }
    }`

    const res = await request.post('/').send({ query }).expect(200)

    expect(res.body.errors[0].extensions.code).toBe('VALIDATION_ERROR')
    const user = await prisma.prismaUser.findUnique({ where: { id: userRecord.id } })
    expect(user.password).toBe(userRecord.password)
    expect(user.passwordResetToken).toBeTruthy()
    expect(user.passwordResetTokenExpiresAt).toBeTruthy()
  })

  it(`should a GraphQL validation error if 'passwordResetToken' is not provided`, async () => {
    const query = `mutation {
      changePasswordUsingToken(params: {
        password: "Th1sIsAG00dPassw0rd",
        passwordConfirm: "Th1sIsAG00dPassw0rd"
      }) {
        message
      }
    }`

    const res = await request.post('/').send({ query }).expect(400)

    expect(res.body.errors[0].extensions.code).toBe('GRAPHQL_VALIDATION_FAILED')
  })

  it(`should a GraphQL validation error if 'password' is not provided`, async () => {
    const query = `mutation {
      changePasswordUsingToken(params: {
        passwordResetToken: "${passwordResetToken}",
        passwordConfirm: "Th1sIsAG00dPassw0rd"
      }) {
        message
      }
    }`

    const res = await request.post('/').send({ query }).expect(400)

    expect(res.body.errors[0].extensions.code).toBe('GRAPHQL_VALIDATION_FAILED')
    const user = await prisma.prismaUser.findUnique({ where: { id: userRecord.id } })
    expect(user.password).toBe(userRecord.password)
    expect(user.passwordResetToken).toBeTruthy()
    expect(user.passwordResetTokenExpiresAt).toBeTruthy()
  })

  it(`should a GraphQL validation error if 'passwordConfirm' is not provided`, async () => {
    const query = `mutation {
      changePasswordUsingToken(params: {
        passwordResetToken: "${passwordResetToken}",
        password: "Th1sIsAG00dPassw0rd"
      }) {
        message
      }
    }`

    const res = await request.post('/').send({ query }).expect(400)

    expect(res.body.errors[0].extensions.code).toBe('GRAPHQL_VALIDATION_FAILED')
    const user = await prisma.prismaUser.findUnique({ where: { id: userRecord.id } })
    expect(user.password).toBe(userRecord.password)
    expect(user.passwordResetToken).toBeTruthy()
    expect(user.passwordResetTokenExpiresAt).toBeTruthy()
  })

  it('should throw an InvalidTokenError if the password reset token is invalid', async () => {
    const query = `mutation {
      changePasswordUsingToken(params: {
        passwordResetToken: "${new UniqueID().toString()}",
        password: "Th1sIsAG00dPassw0rd",
        passwordConfirm: "Th1sIsAG00dPassw0rd"
      }) {
        message
      }
    }`

    const res = await request.post('/').send({ query }).expect(200)

    expect(res.body.errors[0].extensions.code).toBe('INVALID_TOKEN')
    const user = await prisma.prismaUser.findUnique({ where: { id: userRecord.id } })
    expect(user.password).toBe(userRecord.password)
    expect(user.passwordResetToken).toBeTruthy()
    expect(user.passwordResetTokenExpiresAt).toBeTruthy()
  })

  it('should throw an InvalidTokenError if the password reset token is expired', async () => {
    await prisma.prismaUser.update({
      where: { id: userRecord.id },
      data: { passwordResetTokenExpiresAt: new Date(Date.now() - 100) },
    })
    const query = `mutation {
      changePasswordUsingToken(params: {
        passwordResetToken: "${passwordResetToken}",
        password: "Th1sIsAG00dPassw0rd",
        passwordConfirm: "Th1sIsAG00dPassw0rd"
      }) {
        message
      }
    }`

    const res = await request.post('/').send({ query }).expect(200)

    expect(res.body.errors[0].extensions.code).toBe('INVALID_TOKEN')
    const user = await prisma.prismaUser.findUnique({ where: { id: userRecord.id } })
    expect(user.password).toBe(userRecord.password)
    expect(user.passwordResetToken).toBeTruthy()
    expect(user.passwordResetTokenExpiresAt).toBeTruthy()
  })
})

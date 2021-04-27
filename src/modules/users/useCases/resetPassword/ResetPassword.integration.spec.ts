import 'reflect-metadata'
import '@modules/users'
import { PrismaUser } from '@prisma/client'
import { InitializedApolloServer, initApolloServer } from '@shared/infra/http/apollo/initApolloServer'
import supertest from 'supertest'
import prisma from '@shared/infra/database/prisma/prisma'
import UniqueID from '@shared/domain/UniqueID'
import clearAllData from '@shared/infra/database/prisma/utils/clearAllData'
import config from '@config'
import bcrypt from 'bcrypt'
import User from '@modules/users/domain/User'
import PasswordResetTokenCreatedEvent from '@modules/users/domain/events/PasswordResetTokenCreatedEvent'

describe('ResetPassword Integration', () => {
  let initializedServer: InitializedApolloServer
  let request: supertest.SuperTest<supertest.Test>

  let userRecord: PrismaUser

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

    jest.clearAllMocks()
  })

  it('should generate a password reset token and emit PasswordResetTokenCreatedEvent event if the user exists', async () => {
    jest.spyOn(User.prototype as any, 'addDomainEvent')
    const query = `mutation {
      resetPassword(email: "${userRecord.email}") {
        message
      }
    }`

    const res = await request.post('/').send({ query }).expect(200)

    expect(res.body.data.resetPassword.message).toBeTruthy()
    expect((User.prototype as any).addDomainEvent).toHaveBeenCalledTimes(1)
    expect((User.prototype as any).addDomainEvent).toHaveBeenCalledWith(expect.any(PasswordResetTokenCreatedEvent))
  })

  it.skip('should send an email with the token to the email address of the user', () => {})

  it.only('should persist the generated token to the database', async () => {
    const query = `mutation {
      resetPassword(email: "${userRecord.email}") {
        message
      }
    }`

    await request.post('/').send({ query }).expect(200)

    const user = await prisma.prismaUser.findUnique({ where: { email: userRecord.email } })
    expect(user.passwordResetToken).toBeTruthy()
  })

  it('should persist an expiration date correctly', async () => {
    const query = `mutation {
      resetPassword(email: "${userRecord.email}") {
        message
      }
    }`

    await request.post('/').send({ query }).expect(200)

    const user = await prisma.prismaUser.findUnique({ where: { email: userRecord.email } })
    expect(user.passwordResetTokenExpiresAt).toBeTruthy()
    const estimatedExpirationTime = new Date(
      Date.now() + config.auth.refreshTokenExpirationHours * 60 * 60 * 1000
    ).getTime()
    const expirationThreshold = 30 * 1000
    const expirationTime = new Date(user.passwordResetTokenExpiresAt).getTime()
    expect(expirationTime).toBeGreaterThan(estimatedExpirationTime - expirationThreshold)
    expect(expirationTime).toBeLessThan(estimatedExpirationTime + expirationThreshold)
  })

  it('should return a success message if no user is registered with the email address', async () => {
    jest.spyOn(User.prototype, 'generatePasswordResetToken')
    const query = `mutation {
      resetPassword(email: "invalid@email.com") {
        message
      }
    }`

    const res = await request.post('/').send({ query }).expect(200)

    expect(res.body.data.resetPassword.message).toBeTruthy()
    expect(User.prototype.generatePasswordResetToken).not.toHaveBeenCalled()
  })

  it('should throw a GraphQL validation error if no email is provided', async () => {
    const query = `mutation {
      resetPassword {
        message
      }
    }`

    const res = await request.post('/').send({ query }).expect(400)

    expect(res.body.errors[0].extensions.code).toBe('GRAPHQL_VALIDATION_FAILED')
  })

  it('should throw an EmailAddressNotConfirmedError if the email address is not confirmed yet', async () => {
    jest.spyOn(User.prototype, 'generatePasswordResetToken')
    await prisma.prismaUser.update({ where: { id: userRecord.id }, data: { isEmailConfirmed: false } })
    const query = `mutation {
      resetPassword(email: "${userRecord.email}") {
        message
      }
    }`

    const res = await request.post('/').send({ query }).expect(200)

    expect(res.body.errors[0].extensions.code).toBe('EMAIL_NOT_VERIFIED')
    expect(User.prototype.generatePasswordResetToken).not.toHaveBeenCalled()
    const user = await prisma.prismaUser.findUnique({ where: { id: userRecord.id } })
    expect(user.passwordResetToken).toBeFalsy()
    expect(user.passwordResetTokenExpiresAt).toBeFalsy()
  })
})

import 'reflect-metadata'
import '@modules/users'
import config from '@config'
import { PrismaUser } from '@prisma/client'
import UniqueID from '@shared/domain/UniqueID'
import prisma from '@shared/infra/database/prisma/prisma'
import clearAllData from '@shared/infra/database/prisma/utils/clearAllData'
import { InitializedApolloServer, initApolloServer } from '@shared/infra/http/apollo/initApolloServer'
import supertest from 'supertest'
import bcrypt from 'bcrypt'
import crypto from 'crypto'
import { ConfirmEmailTemplate } from '@shared/services/MailerService/templates/ConfirmEmailTemplate'
import { mailerService } from '@shared/services'
import { Result } from '@shared/core/Result'

describe('Send email confirmation', () => {
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
        name: 'Foo Bar',
        email: 'foo@bar.com',
        password: await bcrypt.hash('password', config.auth.bcryptSaltRounds),
        isEmailConfirmed: false,
        emailConfirmationToken: crypto.randomBytes(20).toString('hex'),
      },
    })

    jest.clearAllMocks()

    jest.spyOn(mailerService as any, 'send').mockResolvedValue(Result.ok())
  })

  it('should send re-send the email confirmation email to a registered address', async () => {
    const query = `mutation {
      sendEmailConfirmation(email: "${userRecord.email}") {
        message
      }
    }`

    const res = await request.post('/').send({ query }).expect(200)

    expect(res.body.data.sendEmailConfirmation.message).toBeTruthy()
    const user = await prisma.prismaUser.findUnique({ where: { id: userRecord.id } })
    expect(user.emailConfirmationToken).not.toBe(userRecord.emailConfirmationToken)
    expect(mailerService['send']).toHaveBeenCalledTimes(1)
    const sendToUserArguments = (mailerService as any).send.mock.calls[0]
    expect(sendToUserArguments[0]).toBe(ConfirmEmailTemplate)
    expect(sendToUserArguments[1]).toBe(userRecord.email)
    expect(sendToUserArguments[2].user.id.toString()).toBe(userRecord.id)
  })

  it('should throw a GraphQL validation error if no email address is provided', async () => {
    const query = `mutation {
      sendEmailConfirmation(email: ) {
        message
      }
    }`

    const res = await request.post('/').send({ query }).expect(400)

    expect(res.body.errors[0].extensions.code).toBe('GRAPHQL_PARSE_FAILED')
    const user = await prisma.prismaUser.findUnique({ where: { id: userRecord.id } })
    expect(user.emailConfirmationToken).toBe(userRecord.emailConfirmationToken)
    expect(mailerService['send']).toHaveBeenCalledTimes(0)
  })

  it('should throw a EmailAlreadyConfirmed error if the email address does not exist', async () => {
    const query = `mutation {
      sendEmailConfirmation(email: "${new UniqueID().toString()}") {
        message
      }
    }`

    const res = await request.post('/').send({ query }).expect(200)

    expect(res.body.errors[0].extensions.code).toBe('EMAIL_ALREADY_CONFIRMED')
    expect(mailerService['send']).toHaveBeenCalledTimes(0)
  })

  it('should throw a EmailAlreadyConfirmed error if the email address is already confirmed', async () => {
    await prisma.prismaUser.update({
      where: { id: userRecord.id },
      data: { isEmailConfirmed: true, emailConfirmationToken: null },
    })
    const query = `mutation {
      sendEmailConfirmation(email: "${userRecord.email}") {
        message
      }
    }
    `

    const res = await request.post('/').send({ query }).expect(200)

    expect(res.body.errors[0].extensions.code).toBe('EMAIL_ALREADY_CONFIRMED')
    expect(mailerService['send']).toHaveBeenCalledTimes(0)
  })
})

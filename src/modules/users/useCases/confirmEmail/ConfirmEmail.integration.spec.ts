import 'reflect-metadata'
import '@modules/users'
import config from '@config'
import { PrismaUser } from '@prisma/client'
import UniqueID from '@shared/domain/UniqueID'
import prisma from '@shared/infra/database/prisma/prisma'
import clearAllData from '@shared/infra/database/prisma/utils/clearAllData'
import { InitializedApolloServer, initApolloServer } from '@shared/infra/http/apollo/initApolloServer'
import supertest from 'supertest'
import crypto from 'crypto'
import bcrypt from 'bcrypt'

describe('ConfirmEmail Integration', () => {
  let initializedServer: InitializedApolloServer
  let request: supertest.SuperTest<supertest.Test>

  let userRecord: PrismaUser
  let confirmationToken: string

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

    confirmationToken = crypto.randomBytes(20).toString('hex')
    userRecord = await prisma.prismaUser.create({
      data: {
        id: new UniqueID().toString(),
        email: 'foo@bar.com',
        password: await bcrypt.hash('password', config.auth.bcryptSaltRounds),
        isEmailConfirmed: false,
        emailConfirmationToken: crypto.createHash('sha256').update(confirmationToken).digest('hex').toString(),
      },
    })
  })

  it(`should set the 'isEmailConfirmed' property to true`, async () => {
    const query = `mutation {
      confirmEmail(token: "${confirmationToken}") {
        message
      }
    }`

    const res = await request.post('/').send({ query })

    expect(res.body.data.confirmEmail.message).toBeTruthy()
    const user = await prisma.prismaUser.findUnique({ where: { id: userRecord.id } })
    expect(user.isEmailConfirmed).toBe(true)
  })

  it(`should remove the 'emailConfirmationToken' from the database`, async () => {
    const query = `mutation {
      confirmEmail(token: "${confirmationToken}") {
        message
      }
    }`

    const res = await request.post('/').send({ query }).expect(200)

    expect(res.body.data.confirmEmail.message).toBeTruthy()
    const user = await prisma.prismaUser.findUnique({ where: { id: userRecord.id } })
    expect(user.emailConfirmationToken).toBeFalsy()
  })

  it('should throw an InvalidEmailConfirmationTokenError if the token is not valid', async () => {
    const query = `mutation {
      confirmEmail(token: "${new UniqueID().toString()}") {
        message
      }
    }`

    const res = await request.post('/').send({ query }).expect(200)

    expect(res.body.errors[0].extensions.code).toBe('INVALID_EMAIL_CONFIRMATION_TOKEN')
    const user = await prisma.prismaUser.findUnique({ where: { id: userRecord.id } })
    expect(user.isEmailConfirmed).toBe(false)
    expect(user.emailConfirmationToken).toBeTruthy()
  })

  it('should throw a GraphQL validation error if no token is provided', async () => {
    const query = `mutation {
      confirmEmail() {
        message
      }
    }`

    const res = await request.post('/').send({ query }).expect(400)

    expect(res.body.errors[0].extensions.code).toBe('GRAPHQL_PARSE_FAILED')
    const user = await prisma.prismaUser.findUnique({ where: { id: userRecord.id } })
    expect(user.isEmailConfirmed).toBe(false)
    expect(user.emailConfirmationToken).toBeTruthy()
  })
})

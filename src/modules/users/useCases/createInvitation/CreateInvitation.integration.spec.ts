import 'reflect-metadata'
import '@modules/reservation'
import '@modules/users'
import { PrismaCustomer, PrismaUser } from '.prisma/client'
import UniqueID from '@shared/domain/UniqueID'
import prisma from '@shared/infra/database/prisma/prisma'
import clearAllData from '@shared/infra/database/prisma/utils/clearAllData'
import { InitializedApolloServer, initApolloServer } from '@shared/infra/http/apollo/initApolloServer'
import supertest from 'supertest'
import bcrypt from 'bcrypt'
import config from '@config'
import jwt from 'jsonwebtoken'
import { JwtPayload } from '@modules/users/domain/AccessToken'
import { advanceTo } from 'jest-date-mock'
import NodeMailerService from '@shared/services/MailerService/NodeMailerService'
import { Result } from '@shared/core/Result'
import { InvitationTemplate } from '@shared/services/MailerService/templates/InvitationTemplate'
import TextUtils from '@shared/utils/TextUtils'
import CustomerRole from '@modules/reservation/domain/CustomerRole'

describe('CreateInvitation', () => {
  let initializedServer: InitializedApolloServer
  let request: supertest.SuperTest<supertest.Test>

  let userRecord: PrismaUser
  let customerRecord: PrismaCustomer
  let accessToken: string

  beforeAll(async () => {
    initializedServer = await initApolloServer()
    request = supertest(initializedServer.serverInfo.url)
  })

  afterAll(async () => {
    await initializedServer.apolloServer.stop()
  })

  beforeEach(async () => {
    await clearAllData()

    userRecord = await prisma.prismaUser.create({
      data: {
        id: new UniqueID().toString(),
        email: 'inviter@bar.com',
        password: await bcrypt.hash('password', config.auth.bcryptSaltRounds),
        isEmailConfirmed: true,
      },
    })

    customerRecord = await prisma.prismaCustomer.create({
      data: {
        id: new UniqueID().toString(),
        userId: userRecord.id,
        name: 'Foo Bar',
        role: CustomerRole.Admin,
      },
    })

    accessToken = jwt.sign({ email: userRecord.email, userId: userRecord.id } as JwtPayload, config.auth.jwtSecretKey)

    jest.spyOn(NodeMailerService.prototype as any, 'send').mockResolvedValue(Result.ok())

    jest.clearAllMocks()
  })

  it('should create a valid invitation', async () => {
    const query = `mutation {
      sendInvitation(email: "foo@bar.com") {
        message
      }
    }`

    const res = await request.post('/').send({ query }).set('Authorization', accessToken).expect(200)

    expect(res.body.data.sendInvitation.message).toBeTruthy()
  })

  it('should store the created invitation in the database', async () => {
    advanceTo('2021-06-12 17:00')
    const query = `mutation {
      sendInvitation(email: "foo@bar.com") {
        message
      }
    }`

    await request.post('/').send({ query }).set('Authorization', accessToken).expect(200)

    const numOfInvitations = await prisma.prismaInvitation.count()
    expect(numOfInvitations).toBe(1)
    const invitationRecord = await prisma.prismaInvitation.findFirst()
    expect(invitationRecord.id).toBeTruthy()
    expect(invitationRecord.emailAddress).toBe('foo@bar.com')
    const expectedExpiration = new Date(Date.now() + config.auth.invitationExpirationHours * 60 * 60 * 1000)
    expect(invitationRecord.expiresAt).toEqual(expectedExpiration)
    expect(invitationRecord.inviterId).toBe(userRecord.id)
    expect(invitationRecord.isActive).toBe(true)
    expect(invitationRecord.token).toBeTruthy()
  })

  it('should send an invitation email', async () => {
    const query = `mutation {
      sendInvitation(email: "foo@bar.com") {
        message
      }
    }`

    await request.post('/').send({ query }).set('Authorization', accessToken).expect(200)

    const invitationRecord = await prisma.prismaInvitation.findFirst()
    expect(NodeMailerService.prototype['send']).toHaveBeenCalledTimes(1)
    const sendToUserArguments = (NodeMailerService.prototype as any).send.mock.calls[0]
    expect(sendToUserArguments[0]).toBe(InvitationTemplate)
    expect(sendToUserArguments[1]).toBe('foo@bar.com')
    expect(sendToUserArguments[2].invitation.id.toString()).toBe(invitationRecord.id)
  })

  it('should allow sending an invitation to an email address that already has an ongoing invitation', async () => {
    await prisma.prismaInvitation.create({
      data: {
        id: new UniqueID().toString(),
        inviterId: userRecord.id,
        emailAddress: 'foo@bar.com',
        token: TextUtils.hashText(new UniqueID().toString()),
        expiresAt: new Date('2021-06-13 14:00'),
      },
    })
    const query = `mutation {
      sendInvitation(email: "foo@bar.com") {
        message
      }
    }`

    const res = await request.post('/').send({ query }).set('Authorization', accessToken).expect(200)

    expect(res.body.data.sendInvitation.message).toBeTruthy()
    const numOfInvitationsWithEmail = await prisma.prismaInvitation.count({ where: { emailAddress: 'foo@bar.com' } })
    expect(numOfInvitationsWithEmail).toBe(2)
  })

  it('should throw an InvalidUserEmailError if the email address is invalid', async () => {
    const query = `mutation {
      sendInvitation(email: "foo") {
        message
      }
    }`

    const res = await request.post('/').send({ query }).set('Authorization', accessToken).expect(200)

    expect(res.body.errors[0].extensions.code).toBe('VALIDATION_ERROR')
    const numOfInvitations = await prisma.prismaInvitation.count()
    expect(numOfInvitations).toBe(0)
  })

  it('should throw an EmailAlreadyRegisteredError if the email has already been registered', async () => {
    const query = `mutation {
      sendInvitation(email: "inviter@bar.com") {
        message
      }
    }`

    const res = await request.post('/').send({ query }).set('Authorization', accessToken).expect(200)

    expect(res.body.errors[0].extensions.code).toBe('EMAIL_ALREADY_REGISTERED')
    const numOfInvitations = await prisma.prismaInvitation.count()
    expect(numOfInvitations).toBe(0)
  })

  it('should throw a GraphQL validation failed error if no email address is provided', async () => {
    const query = `mutation {
      sendInvitation() {
        message
      }
    }`

    const res = await request.post('/').send({ query }).set('Authorization', accessToken).expect(400)

    expect(res.body.errors[0].extensions.code).toBe('GRAPHQL_PARSE_FAILED')
    const numOfInvitations = await prisma.prismaInvitation.count()
    expect(numOfInvitations).toBe(0)
  })

  it('should throw an InvalidOrMissingAccessTokenError if no access token is provided', async () => {
    const query = `mutation {
      sendInvitation(email: "foo@bar.com") {
        message
      }
    }`

    const res = await request.post('/').send({ query }).expect(200)

    expect(res.body.errors[0].extensions.code).toBe('INVALID_ACCESS_TOKEN')
    const numOfInvitations = await prisma.prismaInvitation.count()
    expect(numOfInvitations).toBe(0)
  })

  it('should throw a NotAuthorizedError if a non-admin customer tries to create the invitation', async () => {
    await prisma.prismaCustomer.update({ data: { role: CustomerRole.Customer }, where: { id: customerRecord.id } })
    const query = `mutation {
      sendInvitation(email: "foo@bar.com") {
        message
      }
    }`

    const res = await request.post('/').send({ query }).set('Authorization', accessToken).expect(200)

    expect(res.body.errors[0].extensions.code).toBe('NOT_AUTHORIZED')
    const numOfInvitations = await prisma.prismaInvitation.count()
    expect(numOfInvitations).toBe(0)
  })
})

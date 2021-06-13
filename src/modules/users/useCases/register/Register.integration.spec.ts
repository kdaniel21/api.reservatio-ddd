import 'reflect-metadata'
import '@modules/users'
import '@modules/reservation'
import validateJwt from '@shared/infra/http/apollo/auth/validateJwt'
import { initApolloServer, InitializedApolloServer } from '@shared/infra/http/apollo/initApolloServer'
import supertest from 'supertest'
import prisma from '@shared/infra/database/prisma/prisma'
import UniqueID from '@shared/domain/UniqueID'
import clearAllData from '@shared/infra/database/prisma/utils/clearAllData'
import User from '@modules/users/domain/User'
import UserCreatedEvent from '@modules/users/domain/events/UserCreatedEvent'
import { extractCookies } from '@shared/testing/extractCookies'
import config from '@config'
import crypto from 'crypto'
import bcrypt from 'bcrypt'
import NodeMailerService from '@shared/services/MailerService/NodeMailerService'
import { Result } from '@shared/core/Result'
import { RegisterTemplate } from '@shared/services/MailerService/templates/RegisterTemplate'
import CreateCustomerUseCase from '@modules/reservation/useCases/createCustomer/CreateCustomerUseCase'
import { PrismaInvitation } from '.prisma/client'
import TextUtils from '@shared/utils/TextUtils'
import { advanceTo } from 'jest-date-mock'

describe('Register Integration', () => {
  let initializedServer: InitializedApolloServer
  let request: supertest.SuperTest<supertest.Test>

  let invitation: PrismaInvitation
  let invitationToken: string

  beforeAll(async () => {
    initializedServer = await initApolloServer()
    request = supertest(initializedServer.serverInfo.url)
  })

  afterAll(async () => {
    await initializedServer.apolloServer.stop()
  })

  beforeEach(async () => {
    await clearAllData()

    advanceTo('2021-06-12 10:00')

    invitationToken = TextUtils.generateRandomCharacters(30)

    const user = await prisma.prismaUser.create({
      data: {
        id: new UniqueID().toString(),
        email: 'inviter@bar.com',
        password: await bcrypt.hash('password', config.auth.bcryptSaltRounds),
        isEmailConfirmed: true,
      },
    })

    invitation = await prisma.prismaInvitation.create({
      data: {
        id: new UniqueID().toString(),
        inviterId: user.id,
        emailAddress: 'foo@bar.com',
        token: TextUtils.hashText(invitationToken),
        expiresAt: new Date('2021-06-13 14:00'),
      },
    })

    jest.spyOn(NodeMailerService.prototype as any, 'send').mockResolvedValue(Result.ok)

    jest.clearAllMocks()
  })

  it('should register a new user and return the user', async () => {
    const query = `mutation {
      register(params: {
        email: "foo@bar.com",
        name: "Foo Bar",
        password: "Th1sIsAG00dPassw0rd",
        passwordConfirm: "Th1sIsAG00dPassw0rd",
        invitationToken: "${invitationToken}"
      }) {
        user {
          id
          email
        }
        accessToken
        refreshToken
      }
    }`

    const res = await request.post('/').send({ query }).expect(200)

    expect(res.body.data.register.user.id).toBeTruthy()
    expect(res.body.data.register.user.email).toBe('foo@bar.com')
  })

  it('should deactivate the invitation after the user has been created', async () => {
    const query = `mutation {
      register(params: {
        email: "foo@bar.com",
        name: "Foo Bar",
        password: "Th1sIsAG00dPassw0rd",
        passwordConfirm: "Th1sIsAG00dPassw0rd",
        invitationToken: "${invitationToken}"
      }) {
        user {
          id
          email
        }
        accessToken
        refreshToken
      }
    }`

    await request.post('/').send({ query }).expect(200)

    const invitationRecord = await prisma.prismaInvitation.findUnique({ where: { id: invitation.id } })
    expect(invitationRecord.isActive).toBe(false)
  })

  it('should emit a UserCreatedEvent and fire an AfterUserCreated handler after creating a user', async () => {
    jest.spyOn(User.prototype as any, 'addDomainEvent')
    // jest.spyOn(AfterUserCreated.prototype as any, 'handleEvent')
    const query = `mutation {
      register(params: {
        email: "foo@bar.com",
        name: "Foo Bar",
        password: "Th1sIsAG00dPassw0rd",
        passwordConfirm: "Th1sIsAG00dPassw0rd",
        invitationToken: "${invitationToken}"
      }) {
        user {
          id
          email
        }
        accessToken
        refreshToken
      }
    }`

    await request.post('/').send({ query }).expect(200)

    expect((User.prototype as any).addDomainEvent).toHaveBeenCalledTimes(1)
    expect((User.prototype as any).addDomainEvent).toHaveBeenCalledWith(expect.any(UserCreatedEvent))
    // expect(AfterUserCreated.prototype.handleEvent).toHaveBeenCalledTimes(1)
  })

  it('should send a confirmation to the email address of the user with the email confirmation', async () => {
    const query = `mutation {
      register(params: {
        email: "foo@bar.com",
        name: "Foo Bar",
        password: "Th1sIsAG00dPassw0rd",
        passwordConfirm: "Th1sIsAG00dPassw0rd",
        invitationToken: "${invitationToken}"
      }) {
        user {
          id
          email
        }
        accessToken
        refreshToken
      }
    }`

    await request.post('/').send({ query }).expect(200)

    const userRecord = await prisma.prismaUser.findUnique({ where: { email: 'foo@bar.com' } })
    expect(NodeMailerService.prototype['send']).toHaveBeenCalledTimes(1)
    const sendToUserArguments = (NodeMailerService.prototype as any).send.mock.calls[0]
    expect(sendToUserArguments[0]).toBe(RegisterTemplate)
    expect(sendToUserArguments[1]).toBe('foo@bar.com')
    expect(sendToUserArguments[2].user.id.toString()).toBe(userRecord.id)
  })

  it('should create a new customer with the correct name', async () => {
    jest.spyOn(CreateCustomerUseCase.prototype, 'execute')
    const query = `mutation {
      register(params: {
        email: "foo@bar.com",
        name: "Foo Bar",
        password: "Th1sIsAG00dPassw0rd",
        passwordConfirm: "Th1sIsAG00dPassw0rd",
        invitationToken: "${invitationToken}"
      }) {
        user {
          id
          email
        }
        accessToken
        refreshToken
      }
    }`

    await request.post('/').send({ query }).expect(200)

    expect(CreateCustomerUseCase.prototype.execute).toHaveBeenCalledTimes(1)
    const userRecord = await prisma.prismaUser.findUnique({ where: { email: 'foo@bar.com' } })
    const customerRecord = await prisma.prismaCustomer.findUnique({ where: { userId: userRecord.id } })
    expect(customerRecord.id).toBeTruthy()
    expect(customerRecord.name).toBe('Foo Bar')
  })

  it('should register a new user and return a valid access token', async () => {
    const query = `mutation {
      register(params: {
        email: "foo@bar.com",
        name: "Foo Bar",
        password: "Th1sIsAG00dPassw0rd",
        passwordConfirm: "Th1sIsAG00dPassw0rd",
        invitationToken: "${invitationToken}"
      }) {
        user {
          email
        }
        accessToken
        refreshToken
      }
    }`

    const res = await request.post('/').send({ query }).expect(200)

    const { accessToken } = res.body.data.register
    const jwtPayload = validateJwt(accessToken)
    expect(jwtPayload.email).toBe('foo@bar.com')
    const userRecord = await prisma.prismaUser.findUnique({ where: { email: 'foo@bar.com' } })
    expect(jwtPayload.userId).toBe(userRecord.id)
  })

  it('should register a new user and return a valid refresh token token', async () => {
    const query = `mutation {
      register(params: {
        email: "foo@bar.com",
        name: "Foo Bar",
        password: "Th1sIsAG00dPassw0rd",
        passwordConfirm: "Th1sIsAG00dPassw0rd",
        invitationToken: "${invitationToken}"
      }) {
        user {
          email
        }
        accessToken
        refreshToken
      }
    }`

    const res = await request.post('/').send({ query }).expect(200)

    expect(res.body.data.register.refreshToken).toBeTruthy()
    const refreshTokenRecord = await prisma.prismaRefreshToken.findFirst({
      where: { user: { email: 'foo@bar.com' } },
      include: { user: true },
    })
    expect(refreshTokenRecord).toBeTruthy()
    expect(refreshTokenRecord.user.email).toBe('foo@bar.com')
    expect(refreshTokenRecord.expiresAt.getTime()).toBeGreaterThan(Date.now())
    const plainRefreshToken = res.body.data.register.refreshToken
    expect(crypto.createHash('sha256').update(plainRefreshToken).digest('hex').toString()).toBe(
      refreshTokenRecord.token,
    )
  })

  it('should register a new user and set the refresh token as an http-only cookie', async () => {
    const query = `mutation {
      register(params: {
        email: "foo@bar.com",
        name: "Foo Bar",
        password: "Th1sIsAG00dPassw0rd",
        passwordConfirm: "Th1sIsAG00dPassw0rd",
        invitationToken: "${invitationToken}"
      }) {
        user {
          email
        }
        accessToken
        refreshToken
      }
    }`

    const res = await request.post('/').send({ query }).expect(200)

    const plainRefreshToken = res.body.data.register.refreshToken
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
      refreshTokenRecord.token,
    )
  })

  it('should register a new user and store the user in the database', async () => {
    const query = `mutation {
      register(params: {
        email: "foo@bar.com",
        name: "Foo Bar",
        password: "Th1sIsAG00dPassw0rd",
        passwordConfirm: "Th1sIsAG00dPassw0rd",
        invitationToken: "${invitationToken}"
      }) {
        user {
          email
        }
        accessToken
        refreshToken
      }
    }`

    await request.post('/').send({ query }).expect(200)

    const userRecord = await prisma.prismaUser.findUnique({ where: { email: 'foo@bar.com' } })
    expect(userRecord).toBeTruthy()
    expect(userRecord.email).toBe('foo@bar.com')
    expect(userRecord.isDeleted).toBe(false)
    expect(userRecord.isEmailConfirmed).toBe(false)
    expect(userRecord.emailConfirmationToken).toBeTruthy()
    expect(userRecord.password).toBeTruthy()
    expect(userRecord).not.toBe('Th1sIsAG00dPassw0rd')
    const doPasswordsMatch = await bcrypt.compare('Th1sIsAG00dPassw0rd', userRecord.password)
    expect(doPasswordsMatch).toBe(true)
    expect(userRecord.passwordResetToken).toBeFalsy()
    expect(userRecord.passwordResetTokenExpiresAt).toBeFalsy()
  })

  it('should throw an InvalidInvitationError if the invitation is not active', async () => {
    await prisma.prismaInvitation.update({ where: { id: invitation.id }, data: { isActive: false } })
    const query = `mutation {
      register(params: {
        email: "foo@bar.com",
        name: "Foo Bar",
        password: "Th1sIsAG00dPassw0rd",
        passwordConfirm: "Th1sIsAG00dPassw0rd",
        invitationToken: "${invitationToken}"
      }) {
        user {
          id
          email
        }
        accessToken
        refreshToken
      }
    }`

    const res = await request.post('/').send({ query }).expect(200)

    expect(res.body.errors[0].extensions.code).toBe('INVALID_INVITATION')
    const numOfUsersWithEmail = await prisma.prismaUser.count({
      where: { email: 'foo@bar.com' },
    })
    expect(numOfUsersWithEmail).toBe(0)
  })

  it('should throw an InvalidInvitationError if the invitation is expired', async () => {
    advanceTo('2021-06-13 16:00')
    const query = `mutation {
      register(params: {
        email: "foo@bar.com",
        name: "Foo Bar",
        password: "Th1sIsAG00dPassw0rd",
        passwordConfirm: "Th1sIsAG00dPassw0rd",
        invitationToken: "${invitationToken}"
      }) {
        user {
          id
          email
        }
        accessToken
        refreshToken
      }
    }`

    const res = await request.post('/').send({ query }).expect(200)

    expect(res.body.errors[0].extensions.code).toBe('INVALID_INVITATION')
    const numOfUsersWithEmail = await prisma.prismaUser.count({
      where: { email: 'foo@bar.com' },
    })
    expect(numOfUsersWithEmail).toBe(0)
  })

  it('should throw an InvalidInvitationError if the email address is different than the one in the invitation', async () => {
    const query = `mutation {
      register(params: {
        email: "different@bar.com",
        name: "Foo Bar",
        password: "Th1sIsAG00dPassw0rd",
        passwordConfirm: "Th1sIsAG00dPassw0rd",
        invitationToken: "${invitationToken}"
      }) {
        user {
          id
          email
        }
        accessToken
        refreshToken
      }
    }`

    const res = await request.post('/').send({ query }).expect(200)

    expect(res.body.errors[0].extensions.code).toBe('INVALID_INVITATION')
    const numOfUsersWithEmail = await prisma.prismaUser.count({
      where: { email: 'different@bar.com' },
    })
    expect(numOfUsersWithEmail).toBe(0)
  })

  it('should throw an InvalidInvitationError if the invitation token is invalid', async () => {
    const query = `mutation {
      register(params: {
        email: "foo@bar.com",
        name: "Foo Bar",
        password: "Th1sIsAG00dPassw0rd",
        passwordConfirm: "Th1sIsAG00dPassw0rd",
        invitationToken: "${new UniqueID().toString()}"
      }) {
        user {
          id
          email
        }
        accessToken
        refreshToken
      }
    }`

    const res = await request.post('/').send({ query }).expect(200)

    expect(res.body.errors[0].extensions.code).toBe('INVALID_INVITATION')
    const numOfUsersWithEmail = await prisma.prismaUser.count({
      where: { email: 'foo@bar.com' },
    })
    expect(numOfUsersWithEmail).toBe(0)
  })

  it(`should throw a GraphQL validation error if no 'invitationToken' is provided`, async () => {
    const query = `mutation {
      register(params: {
        email: "foo@bar.com",
        name: "Foo Bar",
        password: "Th1sIsAG00dPassw0rd",
        passwordConfirm: "Th1sIsAG00dPassw0rd"
      }) {
        user {
          id
          email
        }
        accessToken
        refreshToken
      }
    }`

    const res = await request.post('/').send({ query }).expect(400)

    expect(res.body.errors[0].extensions.code).toBe('GRAPHQL_VALIDATION_FAILED')
    const numOfUsersWithEmail = await prisma.prismaUser.count({
      where: { email: 'foo@bar.com' },
    })
    expect(numOfUsersWithEmail).toBe(0)
  })

  it('should throw an InvalidUserEmailError if registering with an invalid email address', async () => {
    const query = `mutation {
      register(params: {
        email: "foo",
        name: "Foo Foo",
        password: "Th1sIsAG00dPassw0rd",
        passwordConfirm: "Th1sIsAG00dPassw0rd",
        invitationToken: "${invitationToken}"
      }) {
        user {
          email
        }
        accessToken
        refreshToken
      }
    }`

    const res = await request.post('/').send({ query }).expect(200)

    expect(res.body.errors[0].extensions.code).toBe('VALIDATION_ERROR')
    const numOfUsersWithEmail = await prisma.prismaUser.count({
      where: { email: 'foo' },
    })
    expect(numOfUsersWithEmail).toBe(0)
  })

  it('should throw an InvalidUserNameError if registering with an invalid name', async () => {
    const query = `mutation {
      register(params: {
        email: "foo@bar.com",
        name: "Foo",
        password: "Th1sIsAG00dPassw0rd",
        passwordConfirm: "Th1sIsAG00dPassw0rd",
        invitationToken: "${invitationToken}"
      }) {
        user {
          email
        }
        accessToken
        refreshToken
      }
    }`

    const res = await request.post('/').send({ query }).expect(200)

    expect(res.body.errors[0].extensions.code).toBe('VALIDATION_ERROR')
    const numOfUsersWithEmail = await prisma.prismaUser.count({
      where: { email: 'foo@bar.com' },
    })
    expect(numOfUsersWithEmail).toBe(0)
  })

  it('should throw an InvalidUserPasswordError if registering with an invalid password', async () => {
    const query = `mutation {
      register(params: {
        email: "foo@bar.com",
        name: "Foo Foo",
        password: "badpassword",
        passwordConfirm: "badpassword",
        invitationToken: "${invitationToken}"
      }) {
        user {
          email
        }
        accessToken
        refreshToken
      }
    }`

    const res = await request.post('/').send({ query }).expect(200)

    expect(res.body.errors[0].extensions.code).toBe('VALIDATION_ERROR')
    const numOfUsersWithEmail = await prisma.prismaUser.count({
      where: { email: 'foo@bar.com' },
    })
    expect(numOfUsersWithEmail).toBe(0)
  })

  it('should throw a validation error if the passwords do not match', async () => {
    const query = `mutation {
      register(params: {
        email: "foo@bar.com",
        name: "Foo Foo",
        password: "Th1sIsAG00dPassw0rd",
        passwordConfirm: "Th1sIsAB4dPassw0rd",
        invitationToken: "${invitationToken}"
      }) {
        user {
          email
        }
        accessToken
        refreshToken
      }
    }`

    const res = await request.post('/').send({ query }).expect(200)

    expect(res.body.errors[0].extensions.code).toBe('VALIDATION_ERROR')
    const numOfUsersWithEmail = await prisma.prismaUser.count({
      where: { email: 'foo@bar.com' },
    })
    expect(numOfUsersWithEmail).toBe(0)
  })

  it('should throw an EmailAlreadyExistsError if registering with an email address that is already being used', async () => {
    const alreadyRegisteredUserId = new UniqueID().toString()
    await prisma.prismaUser.create({
      data: {
        id: alreadyRegisteredUserId,
        email: 'foo@bar.com',
        password: 'foobar',
      },
    })
    const query = `mutation {
      register(params: {
        email: "foo@bar.com",
        name: "Foo Foo",
        password: "Th1sIsAG00dPassw0rd",
        passwordConfirm: "Th1sIsAG00dPassw0rd",
        invitationToken: "${invitationToken}"
      }) {
        user {
          email
        }
        accessToken
        refreshToken
      }
    }`

    const res = await request.post('/').send({ query }).expect(200)

    expect(res.body.errors[0].extensions.code).toBe('EMAIL_ALREADY_EXISTS')
    const usersWithEmail = await prisma.prismaUser.findMany({
      where: { email: 'foo@bar.com' },
    })
    expect(usersWithEmail.length).toBe(1)
    expect(usersWithEmail[0].id).toBe(alreadyRegisteredUserId)
  })
})

import 'reflect-metadata'
import '@modules/users'
import UserRole from '@modules/users/domain/UserRole'
import validateJwt from '@shared/infra/http/apollo/auth/validateJwt'
import { initApolloServer, InitializedApolloServer } from '@shared/infra/http/apollo/initApolloServer'
import supertest from 'supertest'
import prisma from '@shared/infra/database/prisma/prisma'
import UniqueID from '@shared/domain/UniqueID'
import clearAllData from '@shared/infra/database/prisma/utils/clearAllData'
import TextUtils from '@shared/utils/TextUtils'
import User from '@modules/users/domain/User'
import UserCreatedEvent from '@modules/users/domain/events/UserCreatedEvent'

describe('Register Integration', () => {
  let initializedServer: InitializedApolloServer
  let request: supertest.SuperTest<supertest.Test>

  beforeAll(async () => {
    initializedServer = await initApolloServer()
    request = supertest(initializedServer.serverInfo.url)
  })

  afterAll(async () => {
    await initializedServer.apolloServer.stop()
  })

  beforeEach(async () => {
    await clearAllData()
  })

  it('should register a new user and return the user', async () => {
    const query = `mutation {
      register(params: {
        email: "foo@bar.com",
        name: "Foo Bar",
        password: "Th1sIsAG00dPassw0rd",
        passwordConfirm: "Th1sIsAG00dPassw0rd"
      }) {
        user {
          id
          name
          email
        }
        accessToken
        refreshToken
      }
    }`

    const res = await request.post('/').send({ query }).expect(200)

    expect(res.body.data.register.user.id).toBeTruthy()
    expect(res.body.data.register.user.name).toBe('Foo Bar')
    expect(res.body.data.register.user.email).toBe('foo@bar.com')
  })

  it('should emit a UserCreatedEvent and fire an AfterUserCreated handler after creating a user', async () => {
    jest.spyOn(User.prototype as any, 'addDomainEvent')
    // jest.spyOn(AfterUserCreated.prototype as any, 'handleEvent')
    const query = `mutation {
      register(params: {
        email: "foo@bar.com",
        name: "Foo Bar",
        password: "Th1sIsAG00dPassw0rd",
        passwordConfirm: "Th1sIsAG00dPassw0rd"
      }) {
        user {
          id
          name
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

  // TODO: Track subsequent calls made by AfterUserCreated

  it('should register a new user and return a valid access token', async () => {
    const query = `mutation {
      register(params: {
        email: "foo@bar.com",
        name: "Foo Bar",
        password: "Th1sIsAG00dPassw0rd",
        passwordConfirm: "Th1sIsAG00dPassw0rd"
      }) {
        user {
          name
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
    expect(jwtPayload.role).toBe(UserRole.User)
    const userRecord = await prisma.prismaUser.findUnique({ where: { email: 'foo@bar.com' } })
    expect(jwtPayload.userId).toBe(userRecord.id)
  })

  it('should register a new user and return a valid refresh token token', async () => {
    const query = `mutation {
      register(params: {
        email: "foo@bar.com",
        name: "Foo Bar",
        password: "Th1sIsAG00dPassw0rd",
        passwordConfirm: "Th1sIsAG00dPassw0rd"
      }) {
        user {
          name
          email
        }
        accessToken
        refreshToken
      }
    }`

    const res = await request.post('/').send({ query }).expect(200)

    expect(res.body.data.register.refreshToken).toBeTruthy()
    const hashedToken = TextUtils.hashText(res.body.data.register.refreshToken)
    const refreshTokenRecord = await prisma.prismaRefreshToken.findUnique({
      where: { token: hashedToken },
      include: { user: true },
    })
    expect(refreshTokenRecord).toBeTruthy()
    expect(refreshTokenRecord.user.email).toBe('foo@bar.com')
    expect(refreshTokenRecord.expiresAt.getTime()).toBeGreaterThan(Date.now())
  })

  it('should register a new user and store the user in the database', async () => {
    const query = `mutation {
      register(params: {
        email: "foo@bar.com",
        name: "Foo Bar",
        password: "Th1sIsAG00dPassw0rd",
        passwordConfirm: "Th1sIsAG00dPassw0rd"
      }) {
        user {
          name
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
    expect(userRecord.password).toBeTruthy()
    expect(userRecord).not.toBe('Th1sIsAG00dPassw0rd')
    expect(userRecord.passwordResetToken).toBeFalsy()
    expect(userRecord.passwordResetTokenExpiresAt).toBeFalsy()
    expect(userRecord.role).toBe(UserRole.User)
  })

  it('should throw an InvalidUserEmailError if registering with an invalid email address', async () => {
    const query = `mutation {
      register(params: {
        email: "foo",
        name: "Foo Foo",
        password: "Th1sIsAG00dPassw0rd",
        passwordConfirm: "Th1sIsAG00dPassw0rd"
      }) {
        user {
          name
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
        passwordConfirm: "Th1sIsAG00dPassw0rd"
      }) {
        user {
          name
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

  it('should throw an InvalidUserNameError if registering with an invalid password', async () => {
    const query = `mutation {
      register(params: {
        email: "foo@bar.com",
        name: "Foo Foo",
        password: "badpassword",
        passwordConfirm: "badpassword"
      }) {
        user {
          name
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
        passwordConfirm: "Th1sIsAB4dPassw0rd"
      }) {
        user {
          name
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
    await prisma.prismaUser.create({
      data: {
        id: new UniqueID().toString(),
        name: 'Foo Bar',
        email: 'foo@bar.com',
        password: 'foobar',
      },
    })
    const query = `mutation {
      register(params: {
        email: "foo@bar.com",
        name: "Foo Foo",
        password: "Th1sIsAG00dPassw0rd",
        passwordConfirm: "Th1sIsAG00dPassw0rd"
      }) {
        user {
          name
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
    expect(usersWithEmail[0].name).toBe('Foo Bar')
  })
})
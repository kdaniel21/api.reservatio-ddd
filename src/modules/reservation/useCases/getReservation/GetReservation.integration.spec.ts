import 'reflect-metadata'
import '@modules/reservation'
import { JwtPayload } from '@modules/users/domain/AccessToken'
import { PrismaUser, PrismaCustomer, PrismaReservation } from '@prisma/client'
import UniqueID from '@shared/domain/UniqueID'
import prisma from '@shared/infra/database/prisma/prisma'
import clearAllData from '@shared/infra/database/prisma/utils/clearAllData'
import { InitializedApolloServer, initApolloServer } from '@shared/infra/http/apollo/initApolloServer'
import supertest from 'supertest'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import config from '@config'
import CustomerRole from '@modules/reservation/domain/CustomerRole'
import { advanceTo } from 'jest-date-mock'
import GetReservationUseCase from './GetReservationUseCase'

describe('GetReservation Integration', () => {
  let initializedServer: InitializedApolloServer
  let request: supertest.SuperTest<supertest.Test>

  let user: PrismaUser
  let customer: PrismaCustomer
  let accessToken: string

  let adminUser: PrismaUser
  let adminAccessToken: string

  let reservation: PrismaReservation

  beforeAll(async () => {
    initializedServer = await initApolloServer()
    request = supertest(initializedServer.serverInfo.url)

    advanceTo('2021-05-03 10:00:00')
  })

  afterAll(async () => {
    await initializedServer.apolloServer.stop()
  })

  beforeEach(async () => {
    await clearAllData()

    user = await prisma.prismaUser.create({
      data: {
        id: new UniqueID().toString(),
        email: 'foo@bar.com',
        password: crypto.randomBytes(20).toString('hex'),
        isEmailConfirmed: true,
      },
    })
    customer = await prisma.prismaCustomer.create({
      data: {
        id: new UniqueID().toString(),
        userId: user.id,
        name: 'Foo Bar',
      },
    })
    accessToken = jwt.sign({ userId: user.id, email: user.email } as JwtPayload, config.auth.jwtSecretKey)

    adminUser = await prisma.prismaUser.create({
      data: {
        id: new UniqueID().toString(),
        email: 'admin@bar.com',
        password: crypto.randomBytes(20).toString('hex'),
        isEmailConfirmed: true,
      },
    })
    await prisma.prismaCustomer.create({
      data: {
        id: new UniqueID().toString(),
        userId: adminUser.id,
        name: 'Admin Bar',
        role: CustomerRole.Admin,
      },
    })
    adminAccessToken = jwt.sign(
      { userId: adminUser.id, email: adminUser.email } as JwtPayload,
      config.auth.jwtSecretKey,
    )

    reservation = await prisma.prismaReservation.create({
      data: {
        id: new UniqueID().toString(),
        name: 'Reservation',
        startTime: new Date('2021-05-04 10:00:00'),
        endTime: new Date('2021-05-04 12:00:00'),
        badminton: true,
        tableTennis: false,
        customer: { connect: { id: customer.id } },
      },
    })

    jest.clearAllMocks()
    jest.spyOn(prisma.prismaReservation, 'findFirst')
  })

  it('should get a single reservation that belongs to the user', async () => {
    const query = `query {
      reservation(id: "${reservation.id}") {
        id
        recurringId
        isActive
        name
        startTime
        endTime
        locations {
          badminton
          tableTennis
        }
        customer {
          id
          name
          role
          user {
            id
            email
          }
        }
        createdAt
        updatedAt
      }
    }`

    const res = await request.post('/').send({ query }).set('Authorization', accessToken).expect(200)

    expect(res.body.data.reservation.id).toBe(reservation.id)
    expect(res.body.data.reservation.name).toBe(reservation.name)
    expect(res.body.data.reservation.isActive).toBe(reservation.isActive)
    expect(res.body.data.reservation.recurringId).toBeFalsy()
    expect(res.body.data.reservation.startTime).toBe(reservation.startTime.toJSON())
    expect(res.body.data.reservation.endTime).toBe(reservation.endTime.toJSON())
    expect(res.body.data.reservation.locations.tableTennis).toBe(reservation.tableTennis)
    expect(res.body.data.reservation.locations.badminton).toBe(reservation.badminton)
    expect(res.body.data.reservation.customer.name).toBe(customer.name)
    expect(res.body.data.reservation.customer.id).toBe(customer.id)
    expect(res.body.data.reservation.customer.role).toEqualCaseInsensitive(customer.role)
    expect(res.body.data.reservation.customer.user.id).toBe(user.id)
    expect(res.body.data.reservation.customer.user.email).toBe(user.email)
    expect(res.body.data.reservation.createdAt).toBe(reservation.createdAt.toJSON())
    expect(res.body.data.reservation.updatedAt).toBe(reservation.updatedAt.toJSON())
  })

  it('should get a single reservation that does not belong to the user but the user is an admin', async () => {
    const query = `query {
      reservation(id: "${reservation.id}") {
        id
        recurringId
        isActive
        name
        startTime
        endTime
        locations {
          badminton
          tableTennis
        }
        customer {
          id
          name
          role
          user {
            id
            email
          }
        }
        createdAt
        updatedAt
      }
    }`

    const res = await request.post('/').send({ query }).set('Authorization', adminAccessToken).expect(200)

    expect(res.body.data.reservation.id).toBe(reservation.id)
    expect(res.body.data.reservation.name).toBe(reservation.name)
    expect(res.body.data.reservation.isActive).toBe(reservation.isActive)
    expect(res.body.data.reservation.recurringId).toBeFalsy()
    expect(res.body.data.reservation.startTime).toBe(reservation.startTime.toJSON())
    expect(res.body.data.reservation.endTime).toBe(reservation.endTime.toJSON())
    expect(res.body.data.reservation.locations.tableTennis).toBe(reservation.tableTennis)
    expect(res.body.data.reservation.locations.badminton).toBe(reservation.badminton)
    expect(res.body.data.reservation.customer.name).toBe(customer.name)
    expect(res.body.data.reservation.customer.id).toBe(customer.id)
    expect(res.body.data.reservation.customer.role).toEqualCaseInsensitive(customer.role)
    expect(res.body.data.reservation.customer.user.id).toBe(user.id)
    expect(res.body.data.reservation.customer.user.email).toBe(user.email)
    expect(res.body.data.reservation.createdAt).toBe(reservation.createdAt.toJSON())
    expect(res.body.data.reservation.updatedAt).toBe(reservation.updatedAt.toJSON())
  })

  it('should throw a ReservationNotFoundError if no reservation exists with given ID', async () => {
    const query = `query {
      reservation(id: "${new UniqueID().toString()}") {
        id
        recurringId
        isActive
        name
        startTime
        endTime
        locations {
          badminton
          tableTennis
        }
        customer {
          id
          name
          role
          user {
            id
            email
          }
        }
        createdAt
        updatedAt
      }
    }`

    const res = await request.post('/').send({ query }).set('Authorization', accessToken).expect(200)

    expect(res.body.errors[0].extensions.code).toBe('RESERVATION_NOT_FOUND')
    expect(prisma.prismaReservation.findFirst).toBeCalled()
  })

  it('should throw a ReservationNotAuthorizedError if the reservation does not belong to the user', async () => {
    const otherUser = await prisma.prismaUser.create({
      data: {
        id: new UniqueID().toString(),
        email: 'apple@bar.com',
        password: crypto.randomBytes(20).toString('hex'),
        isEmailConfirmed: true,
      },
    })
    await prisma.prismaCustomer.create({
      data: {
        id: new UniqueID().toString(),
        userId: otherUser.id,
        name: 'Foo Bar',
      },
    })
    const otherUserAccessToken = jwt.sign(
      { userId: otherUser.id, email: otherUser.email } as JwtPayload,
      config.auth.jwtSecretKey,
    )
    const query = `query {
      reservation(id: "${reservation.id}") {
        id
        recurringId
        isActive
        name
        startTime
        endTime
        locations {
          badminton
          tableTennis
        }
        customer {
          id
          name
          role
          user {
            id
            email
          }
        }
        createdAt
        updatedAt
      }
    }`

    const res = await request.post('/').send({ query }).set('Authorization', otherUserAccessToken).expect(200)

    expect(res.body.errors[0].extensions.code).toBe('RESERVATION_NOT_AUTHORIZED')
  })

  it(`should throw a GraphQL validation error if the 'id' argument is not specified`, async () => {
    const query = `query {
      reservation {
        id
        recurringId
        isActive
        name
        startTime
        endTime
        locations {
          badminton
          tableTennis
        }
        customer {
          id
          name
          role
          user {
            id
            email
          }
        }
        createdAt
        updatedAt
      }
    }`

    const res = await request.post('/').send({ query }).set('Authorization', accessToken).expect(400)

    expect(res.body.errors[0].extensions.code).toBe('GRAPHQL_VALIDATION_FAILED')
    expect(prisma.prismaReservation.findFirst).not.toBeCalled()
  })

  it('should throw an InvalidOrMissingAccessTokenError if no access token is provided', async () => {
    jest.spyOn(GetReservationUseCase.prototype, 'execute')
    const query = `query {
      reservation(id: "${reservation.id}") {
        id
        recurringId
        isActive
        name
        startTime
        endTime
        locations {
          badminton
          tableTennis
        }
        customer {
          id
          name
          role
          user {
            id
            email
          }
        }
        createdAt
        updatedAt
      }
    }`

    const res = await request.post('/').send({ query }).expect(200)

    expect(res.body.errors[0].extensions.code).toBe('INVALID_ACCESS_TOKEN')
    expect(prisma.prismaReservation.findFirst).not.toBeCalled()
    expect(GetReservationUseCase.prototype.execute).not.toBeCalled()
  })

  it('should throw a CustomerNotFoundError if the customer profile does not exist', async () => {
    const userWithoutCustomerProfile = await prisma.prismaUser.create({
      data: {
        id: new UniqueID().toString(),
        email: 'other@bar.com',
        password: crypto.randomBytes(20).toString('hex'),
        isEmailConfirmed: true,
      },
    })
    const userWithoutCustomerProfileAccessToken = jwt.sign(
      { userId: userWithoutCustomerProfile.id, email: userWithoutCustomerProfile.email } as JwtPayload,
      config.auth.jwtSecretKey,
    )
    const query = `query {
      reservation(id: "${reservation.id}") {
        id
        recurringId
        isActive
        name
        startTime
        endTime
        locations {
          badminton
          tableTennis
        }
        customer {
          id
          name
          role
          user {
            id
            email
          }
        }
        createdAt
        updatedAt
      }
    }`

    const res = await request
      .post('/')
      .send({ query })
      .set('Authorization', userWithoutCustomerProfileAccessToken)
      .expect(200)

    expect(res.body.errors[0].extensions.code).toBe('CUSTOMER_NOT_FOUND')
  })
})

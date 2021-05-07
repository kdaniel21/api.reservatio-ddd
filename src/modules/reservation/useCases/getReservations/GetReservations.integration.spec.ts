import 'reflect-metadata'
import '@modules/reservation'
import CustomerRole from '@modules/reservation/domain/CustomerRole'
import { JwtPayload } from '@modules/users/domain/AccessToken'
import { PrismaUser, PrismaCustomer, PrismaReservation, Prisma } from '@prisma/client'
import UniqueID from '@shared/domain/UniqueID'
import prisma from '@shared/infra/database/prisma/prisma'
import clearAllData from '@shared/infra/database/prisma/utils/clearAllData'
import { InitializedApolloServer, initApolloServer } from '@shared/infra/http/apollo/initApolloServer'
import { advanceTo } from 'jest-date-mock'
import supertest from 'supertest'
import crypto from 'crypto'
import config from '@config'
import jwt from 'jsonwebtoken'

describe('GetReservation Integration', () => {
  let initializedServer: InitializedApolloServer
  let request: supertest.SuperTest<supertest.Test>

  let user: PrismaUser
  let customer: PrismaCustomer
  let accessToken: string

  let adminUser: PrismaUser
  let adminCustomer: PrismaCustomer
  let adminAccessToken: string

  let userWithoutReservations: PrismaUser
  let customerWithoutReservation: PrismaCustomer
  let accessTokenWithoutReservation: string

  let reservations: Partial<PrismaReservation>[]

  beforeAll(async () => {
    initializedServer = await initApolloServer()
    request = supertest(initializedServer.serverInfo.url)
  })

  afterAll(async () => {
    await initializedServer.apolloServer.stop()
  })

  beforeEach(async () => {
    advanceTo('2021-05-03 10:00')
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
    adminCustomer = await prisma.prismaCustomer.create({
      data: {
        id: new UniqueID().toString(),
        userId: adminUser.id,
        name: 'Admin Bar',
        role: CustomerRole.Admin,
      },
    })
    adminAccessToken = jwt.sign(
      { userId: adminUser.id, email: adminUser.email } as JwtPayload,
      config.auth.jwtSecretKey
    )

    userWithoutReservations = await prisma.prismaUser.create({
      data: {
        id: new UniqueID().toString(),
        email: 'baz@bar.com',
        password: crypto.randomBytes(20).toString('hex'),
        isEmailConfirmed: true,
      },
    })
    customerWithoutReservation = await prisma.prismaCustomer.create({
      data: {
        id: new UniqueID().toString(),
        userId: userWithoutReservations.id,
        name: 'No Reservations',
      },
    })
    accessTokenWithoutReservation = jwt.sign(
      { userId: userWithoutReservations.id, email: userWithoutReservations.email } as JwtPayload,
      config.auth.jwtSecretKey
    )

    reservations = [
      {
        id: new UniqueID().toString(),
        name: 'This week Reservation 1',
        startTime: new Date('2021-05-04 10:00:00'),
        endTime: new Date('2021-05-04 12:00:00'),
        badminton: true,
        tableTennis: false,
        customerId: customer.id,
        isActive: true,
      },
      {
        id: new UniqueID().toString(),
        name: 'This Week Reservation 2',
        startTime: new Date('2021-05-06 16:00:00'),
        endTime: new Date('2021-05-06 17:00:00'),
        badminton: true,
        tableTennis: true,
        customerId: customer.id,
        isActive: true,
      },
      {
        id: new UniqueID().toString(),
        name: 'This week Reservation 3',
        startTime: new Date('2021-05-09 20:00:00'),
        endTime: new Date('2021-05-09 22:00:00'),
        badminton: false,
        tableTennis: true,
        customerId: customer.id,
        isActive: true,
      },
      {
        id: new UniqueID().toString(),
        name: 'Next Week Reservation 1',
        startTime: new Date('2021-05-11 17:15:00'),
        endTime: new Date('2021-05-11 18:30:00'),
        badminton: false,
        tableTennis: true,
        customerId: customer.id,
        isActive: true,
      },
      {
        id: new UniqueID().toString(),
        name: 'Past Week Reservation 1',
        startTime: new Date('2021-05-01 17:15:00'),
        endTime: new Date('2021-05-01 18:30:00'),
        badminton: false,
        tableTennis: true,
        customerId: customer.id,
        isActive: true,
      },
      {
        id: new UniqueID().toString(),
        name: 'Past Week Reservation 2 OTHER USER',
        startTime: new Date('2021-05-02 13:15:00'),
        endTime: new Date('2021-05-02 15:30:00'),
        badminton: false,
        tableTennis: true,
        customerId: adminCustomer.id,
        isActive: true,
      },
      {
        id: new UniqueID().toString(),
        name: 'This week 4 NOT ACTIVE',
        startTime: new Date('2021-05-04 14:00:00'),
        endTime: new Date('2021-05-04 15:30:00'),
        badminton: false,
        tableTennis: true,
        customerId: customer.id,
        isActive: false,
      },
    ]
    await prisma.prismaReservation.createMany({ data: reservations as Prisma.PrismaReservationCreateManyInput[] })

    jest.clearAllMocks()
    jest.spyOn(prisma.prismaReservation, 'findMany')
  })

  it('should care only about the date of startDate and endDate and return all reservations for a future week', async () => {
    advanceTo('2021-05-01 11:30')
    const query = `query {
      reservations(
        startDate: "${new Date('2021-05-03 13:00')}",
        endDate: "${new Date('2021-05-09 12:34')}"
      ) {
        id
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
      }
    }`

    const res = await request.post('/').send({ query }).set('Authorization', accessToken).expect(200)

    expect(res.body.data.reservations.length).toBe(3)
    const reservationIds = reservations.slice(0, 2).map(reservation => reservation.id)
    const responseReservationIds = res.body.data.reservations.map((reservation: any) => reservation.id)
    expect(responseReservationIds).toIncludeAllMembers(reservationIds)
    expect(res.body.data.reservations[0].id).toBe(reservations[0].id)
    expect(res.body.data.reservations[0].name).toBe(reservations[0].name)
    expect(res.body.data.reservations[0].isActive).toBe(reservations[0].isActive)
    expect(res.body.data.reservations[0].startTime).toBe(reservations[0].startTime.toJSON())
    expect(res.body.data.reservations[0].endTime).toBe(reservations[0].endTime.toJSON())
    expect(res.body.data.reservations[0].locations.tableTennis).toBe(reservations[0].tableTennis)
    expect(res.body.data.reservations[0].locations.badminton).toBe(reservations[0].badminton)
    expect(res.body.data.reservations[0].customer.name).toBe(customer.name)
    expect(res.body.data.reservations[0].customer.id).toBe(customer.id)
    expect(res.body.data.reservations[0].customer.role).toEqualCaseInsensitive(customer.role)
    expect(res.body.data.reservations[0].customer.user.id).toBe(user.id)
    expect(res.body.data.reservations[0].customer.user.email).toBe(user.email)
  })

  it('should return the reservations only for the coming days for the current week', async () => {
    advanceTo('2021-05-07 09:00')
    const query = `query {
      reservations(
        startDate: "${new Date('2021-05-03 13:00')}",
        endDate: "${new Date('2021-05-09 12:34')}"
      ) {
        id
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
      }
    }`

    const res = await request.post('/').send({ query }).set('Authorization', accessTokenWithoutReservation).expect(200)

    expect(res.body.data.reservations.length).toBe(1)
    expect(res.body.data.reservations[0].id).toBe(reservations[2].id)
  })

  it('should return the reservations only for the coming days for the current week and the ones that were made by the user', async () => {
    advanceTo('2021-05-07 09:00')
    const query = `query {
      reservations(
        startDate: "${new Date('2021-05-03 13:00')}",
        endDate: "${new Date('2021-05-09 12:34')}"
      ) {
        id
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
      }
    }`

    const res = await request.post('/').send({ query }).set('Authorization', accessToken).expect(200)

    expect(res.body.data.reservations.length).toBe(3)
    const responseReservationIds = res.body.data.reservations.map((reservation: any) => reservation.id)
    const reservationIds = reservations.slice(0, 2).map(reservation => reservation.id)
    expect(responseReservationIds).toIncludeAllMembers(reservationIds)
  })

  it('should return reservations for a single day', async () => {
    const query = `query {
      reservations(
        startDate: "${new Date('2021-05-06 13:42')}",
        endDate: "${new Date('2021-05-06 12:34')}"
      ) {
        id
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
      }
    }`

    const res = await request.post('/').send({ query }).set('Authorization', accessToken).expect(200)

    expect(res.body.data.reservations.length).toBe(1)
    expect(res.body.data.reservations[0].id).toBe(reservations[1].id)
  })

  it('should throw a InvalidTimeSpanError if the time period is more than a week', async () => {
    const query = `query {
      reservations(
        startDate: "${new Date('2021-05-06 13:42')}",
        endDate: "${new Date('2021-05-14 12:34')}"
      ) {
        id
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
      }
    }`

    const res = await request.post('/').send({ query }).set('Authorization', accessToken).expect(200)

    expect(res.body.errors[0].extensions.code).toBe('INVALID_TIME_SPAN')
    expect(prisma.prismaReservation.findMany).not.toBeCalled()
  })

  it('should return only the reservations that belongs to the user if a past week is requested', async () => {
    const query = `query {
      reservations(
        startDate: "${new Date('2021-04-26 13:42')}",
        endDate: "${new Date('2021-05-02 12:34')}"
      ) {
        id
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
      }
    }`

    const res = await request.post('/').send({ query }).set('Authorization', accessToken).expect(200)

    expect(res.body.data.reservations.length).toBe(1)
    expect(res.body.data.reservations[0].id).toBe(reservations[4].id)
  })

  it('should return nothing for a past week if the user does not have any reservations', async () => {
    const query = `query {
      reservations(
        startDate: "${new Date('2021-04-26 13:42')}",
        endDate: "${new Date('2021-05-02 12:34')}"
      ) {
        id
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
      }
    }`

    const res = await request.post('/').send({ query }).set('Authorization', accessTokenWithoutReservation).expect(200)

    expect(res.body.data.reservations.length).toBe(0)
  })

  it('should return all reservations for an admin for the current week', async () => {
    advanceTo('2021-05-07 17:32')
    const query = `query {
      reservations(
        startDate: "${new Date('2021-05-03 13:42')}",
        endDate: "${new Date('2021-05-09 12:34')}"
      ) {
        id
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
      }
    }`

    const res = await request.post('/').send({ query }).set('Authorization', accessToken).expect(200)

    expect(res.body.data.reservations.length).toBe(3)
    const reservationIds = reservations.slice(0, 2).map(reservation => reservation.id)
    const responseReservationIds = res.body.data.reservations.map((reservation: any) => reservation.id)
    expect(responseReservationIds).toIncludeAllMembers(reservationIds)
  })

  it('should return all reservations for an admin for a future week', async () => {
    const query = `query {
      reservations(
        startDate: "${new Date('2021-05-03 13:42')}",
        endDate: "${new Date('2021-05-09 12:34')}"
      ) {
        id
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
      }
    }`

    const res = await request.post('/').send({ query }).set('Authorization', accessToken).expect(200)

    expect(res.body.data.reservations.length).toBe(3)
    const reservationIds = reservations.slice(0, 2).map(reservation => reservation.id)
    const responseReservationIds = res.body.data.reservations.map((reservation: any) => reservation.id)
    expect(responseReservationIds).toIncludeAllMembers(reservationIds)
  })

  it('should return all reservations for an admin for a past week', async () => {
    advanceTo('2021-05-12 16:42')
    const query = `query {
      reservations(
        startDate: "${new Date('2021-05-03 13:42')}",
        endDate: "${new Date('2021-05-09 12:34')}"
      ) {
        id
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
      }
    }`

    const res = await request.post('/').send({ query }).set('Authorization', accessToken).expect(200)

    expect(res.body.data.reservations.length).toBe(3)
    const reservationIds = reservations.slice(0, 2).map(reservation => reservation.id)
    const responseReservationIds = res.body.data.reservations.map((reservation: any) => reservation.id)
    expect(responseReservationIds).toIncludeAllMembers(reservationIds)
  })

  it(`should throw a GraphQL validation error if the 'startDate' argument is not specified`, async () => {
    const query = `query {
      reservations(
        endDate: "${new Date('2021-05-09 12:34')}"
      ) {
        id
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
      }
    }`

    const res = await request.post('/').send({ query }).set('Authorization', accessToken).expect(400)

    expect(res.body.errors[0].extensions.code).toBe('GRAPHQL_VALIDATION_FAILED')
  })

  it(`should throw a GraphQL validation error if the 'endDate' argument is not specified`, async () => {
    const query = `query {
      reservations(
        startDate: "${new Date('2021-05-09 12:34')}"
      ) {
        id
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
      }
    }`

    const res = await request.post('/').send({ query }).set('Authorization', accessToken).expect(400)

    expect(res.body.errors[0].extensions.code).toBe('GRAPHQL_VALIDATION_FAILED')
    expect(prisma.prismaReservation.findMany).not.toBeCalled()
  })

  it('should throw an InvalidOrMissingAccessTokenError if no access token is provided', async () => {
    const query = `query {
      reservations(
        startDate: "${new Date('2021-05-03 13:42')}",
        endDate: "${new Date('2021-05-09 12:34')}"
      ) {
        id
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
      }
    }`

    const res = await request.post('/').send({ query }).expect(200)

    expect(res.body.errors[0].extensions.code).toBe('INVALID_ACCESS_TOKEN')
    expect(prisma.prismaReservation.findMany).not.toBeCalled()
  })

  it('should return an empty array if no reservations are made', async () => {
    await prisma.prismaReservation.deleteMany()
    const query = `query {
      reservations(
        startDate: "${new Date('2021-05-03 13:42')}",
        endDate: "${new Date('2021-05-09 12:34')}"
      ) {
        id
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
      }
    }`

    const res = await request.post('/').send({ query }).set('Authorization', accessToken).expect(200)

    expect(res.body.data.reservations.length).toBe(0)
  })

  it(`should not return non-active reservations for a past week for a user`, async () => {
    advanceTo('2021-05-14 13:32')
    const query = `query {
      reservations(
        startDate: "${new Date('2021-05-03 13:00')}",
        endDate: "${new Date('2021-05-09 12:34')}"
      ) {
        id
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
      }
    }`

    const res = await request.post('/').send({ query }).set('Authorization', accessToken).expect(200)

    expect(res.body.data.reservations.length).toBe(3)
    const reservationIds = reservations.slice(0, 2).map(reservation => reservation.id)
    const responseReservationIds = res.body.data.reservations.map((reservation: any) => reservation.id)
    expect(responseReservationIds).toIncludeAllMembers(reservationIds)
  })

  it(`should not return non-active reservations for the current week for a user`, async () => {
    const query = `query {
      reservations(
        startDate: "${new Date('2021-05-03 13:00')}",
        endDate: "${new Date('2021-05-09 12:34')}"
      ) {
        id
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
      }
    }`

    const res = await request.post('/').send({ query }).set('Authorization', accessToken).expect(200)

    expect(res.body.data.reservations.length).toBe(3)
    const reservationIds = reservations.slice(0, 2).map(reservation => reservation.id)
    const responseReservationIds = res.body.data.reservations.map((reservation: any) => reservation.id)
    expect(responseReservationIds).toIncludeAllMembers(reservationIds)
  })

  it(`should not return non-active reservations for a future week for a user`, async () => {
    advanceTo('2021-05-01 19:41')
    const query = `query {
      reservations(
        startDate: "${new Date('2021-05-03 13:00')}",
        endDate: "${new Date('2021-05-09 12:34')}"
      ) {
        id
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
      }
    }`

    const res = await request.post('/').send({ query }).set('Authorization', accessToken).expect(200)

    expect(res.body.data.reservations.length).toBe(3)
    const reservationIds = reservations.slice(0, 2).map(reservation => reservation.id)
    const responseReservationIds = res.body.data.reservations.map((reservation: any) => reservation.id)
    expect(responseReservationIds).toIncludeAllMembers(reservationIds)
  })

  it(`should return non-active reservations for a past week for an admin`, async () => {
    advanceTo('2021-05-14 13:32')
    const query = `query {
      reservations(
        startDate: "${new Date('2021-05-03 13:00')}",
        endDate: "${new Date('2021-05-09 12:34')}"
      ) {
        id
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
      }
    }`

    const res = await request.post('/').send({ query }).set('Authorization', adminAccessToken).expect(200)

    expect(res.body.data.reservations.length).toBe(4)
    const reservationIds = reservations.slice(0, 2).map(reservation => reservation.id)
    const responseReservationIds = res.body.data.reservations.map((reservation: any) => reservation.id)
    expect(responseReservationIds).toIncludeAllMembers([...reservationIds, reservations[6].id])
  })

  it(`should return non-active reservations for the current week for an admin`, async () => {
    const query = `query {
      reservations(
        startDate: "${new Date('2021-05-03 13:00')}",
        endDate: "${new Date('2021-05-09 12:34')}"
      ) {
        id
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
      }
    }`

    const res = await request.post('/').send({ query }).set('Authorization', adminAccessToken).expect(200)

    expect(res.body.data.reservations.length).toBe(4)
    const reservationIds = reservations.slice(0, 2).map(reservation => reservation.id)
    const responseReservationIds = res.body.data.reservations.map((reservation: any) => reservation.id)
    expect(responseReservationIds).toIncludeAllMembers([...reservationIds, reservations[6].id])
  })

  it(`should return non-active reservations for a future week for an admin`, async () => {
    advanceTo('2021-05-01 10:10')
    const query = `query {
      reservations(
        startDate: "${new Date('2021-05-03 13:00')}",
        endDate: "${new Date('2021-05-09 12:34')}"
      ) {
        id
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
      }
    }`

    const res = await request.post('/').send({ query }).set('Authorization', adminAccessToken).expect(200)

    expect(res.body.data.reservations.length).toBe(4)
    const reservationIds = reservations.slice(0, 2).map(reservation => reservation.id)
    const responseReservationIds = res.body.data.reservations.map((reservation: any) => reservation.id)
    expect(responseReservationIds).toIncludeAllMembers([...reservationIds, reservations[6].id])
  })
})

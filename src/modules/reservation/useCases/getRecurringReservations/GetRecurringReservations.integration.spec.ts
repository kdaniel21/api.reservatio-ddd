import 'reflect-metadata'
import '@modules/reservation'
import { JwtPayload } from '@modules/users/domain/AccessToken'
import { PrismaUser, PrismaCustomer, PrismaReservation, Prisma } from '@prisma/client'
import UniqueID from '@shared/domain/UniqueID'
import prisma from '@shared/infra/database/prisma/prisma'
import clearAllData from '@shared/infra/database/prisma/utils/clearAllData'
import { InitializedApolloServer, initApolloServer } from '@shared/infra/http/apollo/initApolloServer'
import { advanceTo } from 'jest-date-mock'
import supertest from 'supertest'
import config from '@config'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import CustomerRole from '@modules/reservation/domain/CustomerRole'

describe('GetRecurringReservations', () => {
  let initializedServer: InitializedApolloServer
  let request: supertest.SuperTest<supertest.Test>

  let user: PrismaUser
  let customer: PrismaCustomer
  let accessToken: string
  let reservations: Partial<PrismaReservation>[]
  let recurringId: UniqueID

  beforeAll(async () => {
    initializedServer = await initApolloServer()
    request = supertest(initializedServer.serverInfo.url)
  })

  afterAll(async () => {
    await initializedServer.apolloServer.stop()
  })

  beforeEach(async () => {
    await clearAllData()

    advanceTo(new Date('2021-05-03 10:00:00'))

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

    recurringId = new UniqueID()
    reservations = [
      {
        id: new UniqueID().toString(),
        recurringId: recurringId.toString(),
        name: 'Past 1',
        startTime: new Date('2021-05-01 10:00:00'),
        endTime: new Date('2021-05-01 12:00:00'),
        badminton: true,
        tableTennis: false,
        customerId: customer.id,
        isActive: true,
      },
      {
        id: new UniqueID().toString(),
        recurringId: recurringId.toString(),
        name: 'Future 1',
        startTime: new Date('2021-05-08 10:00:00'),
        endTime: new Date('2021-05-08 12:00:00'),
        badminton: true,
        tableTennis: false,
        customerId: customer.id,
        isActive: true,
      },
      {
        id: new UniqueID().toString(),
        recurringId: recurringId.toString(),
        name: 'Future 2',
        startTime: new Date('2021-05-15 10:00:00'),
        endTime: new Date('2021-05-15 12:00:00'),
        badminton: true,
        tableTennis: false,
        customerId: customer.id,
        isActive: true,
      },
      {
        id: new UniqueID().toString(),
        recurringId: recurringId.toString(),
        name: 'Future 3',
        startTime: new Date('2021-05-22 10:00:00'),
        endTime: new Date('2021-05-22 12:00:00'),
        badminton: true,
        tableTennis: false,
        customerId: customer.id,
        isActive: true,
      },
    ]
    await prisma.prismaReservation.createMany({ data: reservations as Prisma.PrismaReservationCreateManyInput[] })

    jest.clearAllMocks()
  })

  it(`should get all reservations that belong to the same 'recurringId' and are active`, async () => {
    await prisma.prismaReservation.create({
      data: {
        id: new UniqueID().toString(),
        recurringId: recurringId.toString(),
        name: 'Deactivated future 5',
        startTime: new Date('2021-05-28 10:00:00'),
        endTime: new Date('2021-05-28 12:00:00'),
        badminton: true,
        tableTennis: false,
        customerId: customer.id,
        isActive: false,
      },
    })
    const query = `query {
      recurringReservations(recurringId: "${recurringId.toString()}") {
        id
        recurringId
        name
      }
    }`

    const res = await request.post('/').send({ query }).set('Authorization', accessToken).expect(200)

    expect(res.body.data.recurringReservations.length).toBe(4)
    const responseIds = res.body.data.recurringReservations.map((reservation: any) => reservation.id)
    const reservationIds = reservations.map(reservation => reservation.id)
    expect(responseIds).toIncludeSameMembers(reservationIds)
    const responseNames = res.body.data.recurringReservations.map((reservation: any) => reservation.name)
    const reservationNames = reservations.map(reservation => reservation.name)
    expect(responseNames).toIncludeSameMembers(reservationNames)
  })

  it(`should be able to fetch the same properties as the 'reservations' query`, async () => {
    const query = `query {
      recurringReservations(recurringId: "${recurringId.toString()}") {
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

    expect(res.body.data.recurringReservations[0].id).toBe(reservations[0].id)
    expect(res.body.data.recurringReservations[0].name).toBe(reservations[0].name)
    expect(res.body.data.recurringReservations[0].isActive).toBe(reservations[0].isActive)
    expect(res.body.data.recurringReservations[0].recurringId).toBe(reservations[0].recurringId)
    expect(res.body.data.recurringReservations[0].startTime).toBeTruthy()
    expect(res.body.data.recurringReservations[0].endTime).toBeTruthy()
    expect(res.body.data.recurringReservations[0].locations.tableTennis).toBe(reservations[0].tableTennis)
    expect(res.body.data.recurringReservations[0].locations.badminton).toBe(reservations[0].badminton)
    expect(res.body.data.recurringReservations[0].customer.name).toBe(customer.name)
    expect(res.body.data.recurringReservations[0].customer.id).toBe(customer.id)
    expect(res.body.data.recurringReservations[0].customer.role).toEqualCaseInsensitive(customer.role)
    expect(res.body.data.recurringReservations[0].customer.user.id).toBe(user.id)
    expect(res.body.data.recurringReservations[0].customer.user.email).toBe(user.email)
    expect(res.body.data.recurringReservations[0].createdAt).toBeTruthy()
    expect(res.body.data.recurringReservations[0].updatedAt).toBeTruthy()
  })

  it(`should get all future reservations that belong to the same 'recurringId'`, async () => {
    const query = `query {
      recurringReservations(recurringId: "${recurringId.toString()}", futureOnly: true) {
        id
        recurringId
        name
      }
    }`

    const res = await request.post('/').send({ query }).set('Authorization', accessToken).expect(200)

    reservations.splice(0, 1)
    expect(res.body.data.recurringReservations.length).toBe(3)
    const responseIds = res.body.data.recurringReservations.map((reservation: any) => reservation.id)
    const reservationIds = reservations.map(reservation => reservation.id)
    expect(responseIds).toIncludeSameMembers(reservationIds)
    const responseNames = res.body.data.recurringReservations.map((reservation: any) => reservation.name)
    const reservationNames = reservations.map(reservation => reservation.name)
    expect(responseNames).toIncludeSameMembers(reservationNames)
  })

  it('should throw a NotAuthorized error if the reservations do not belong to the user', async () => {
    const otherUser = await prisma.prismaUser.create({
      data: {
        id: new UniqueID().toString(),
        email: 'other@bar.com',
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
      recurringReservations(recurringId: "${recurringId.toString()}") {
        id
        recurringId
        name
      }
    }`

    const res = await request.post('/').send({ query }).set('Authorization', otherUserAccessToken).expect(200)

    expect(res.body.errors[0].extensions.code).toBe('NOT_AUTHORIZED')
  })

  it('should not throw a NotAuthorizedError if the reservation do not belong to the user but the user is an admin', async () => {
    const adminUser = await prisma.prismaUser.create({
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
        name: 'Foo Bar',
        role: CustomerRole.Admin,
      },
    })
    const adminAccessToken = jwt.sign(
      { userId: adminUser.id, email: adminUser.email } as JwtPayload,
      config.auth.jwtSecretKey,
    )

    const query = `query {
      recurringReservations(recurringId: "${recurringId.toString()}") {
        id
        recurringId
        name
      }
    }`

    const res = await request.post('/').send({ query }).set('Authorization', adminAccessToken).expect(200)

    expect(res.body.errors).toBeFalsy()
    expect(res.body.data.recurringReservations.length).toBe(4)
  })

  it('should throw an InvalidOrMissingAccessTokenError if no access token is provided', async () => {
    const query = `query {
      recurringReservations(recurringId: "${recurringId.toString()}") {
        id
        recurringId
        name
      }
    }`

    const res = await request.post('/').send({ query }).expect(200)

    expect(res.body.errors[0].extensions.code).toBe('INVALID_ACCESS_TOKEN')
  })

  it('should throw an InvalidOrmMissingAccessTokenError if the access token is invalid', async () => {
    const query = `query {
      recurringReservations(recurringId: "${recurringId.toString()}") {
        id
        recurringId
        name
      }
    }`

    const res = await request.post('/').send({ query }).set('Authorization', new UniqueID().toString()).expect(200)

    expect(res.body.errors[0].extensions.code).toBe('INVALID_ACCESS_TOKEN')
  })

  it(`should throw a GraphQL validation error if the 'recurringId' property is not provided`, async () => {
    const query = `query {
      recurringReservations(futureOnly: true) {
        id
        recurringId
        name
      }
    }`

    const res = await request.post('/').send({ query }).set('Authorization', accessToken).expect(400)

    expect(res.body.errors[0].extensions.code).toBe('GRAPHQL_VALIDATION_FAILED')
  })
})

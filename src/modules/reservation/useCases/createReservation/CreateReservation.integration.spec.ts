import 'reflect-metadata'
import '@modules/reservations'
import { PrismaCustomer, PrismaUser } from '.prisma/client'
import UniqueID from '@shared/domain/UniqueID'
import prisma from '@shared/infra/database/prisma/prisma'
import clearAllData from '@shared/infra/database/prisma/utils/clearAllData'
import { InitializedApolloServer, initApolloServer } from '@shared/infra/http/apollo/initApolloServer'
import supertest from 'supertest'
import crypto from 'crypto'
import jwt from 'jsonwebtoken'
import { JwtPayload } from '@modules/users/domain/AccessToken'
import config from '@config'
import { ReservationLocationEnum } from '@modules/reservation/domain/ReservationLocation'
import IsTimeAvailableUseCase from '../isTimeAvailable/IsTimeAvailableUseCase'
import { mocked } from 'ts-jest/utils'
import { Result } from '@shared/core/Result'
import ReservationName from '@modules/reservation/domain/ReservationName'

const tomorrow = (time: string) => {
  const tomorrow = new Date()
  tomorrow.setDate(new Date().getDate() + 1)

  return new Date(`${tomorrow.toLocaleDateString()} ${time}`)
}

describe('CreateReservation Integration', () => {
  let initializedServer: InitializedApolloServer
  let request: supertest.SuperTest<supertest.Test>

  let user: PrismaUser
  let customer: PrismaCustomer
  let accessToken: string

  mocked(IsTimeAvailableUseCase.prototype.execute).mockResolvedValue(Result.ok({ isTimeAvailable: true }))

  beforeAll(async () => {
    initializedServer = await initApolloServer()
    request = supertest(initializedServer.serverInfo.url)
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

    jest.clearAllMocks()
    jest.spyOn(IsTimeAvailableUseCase.prototype, 'execute')
  })

  it('should create a reservation if for a single location the IsTimeAvailable use case returns true', async () => {
    const query = `mutation {
      createReservation(
        name: "Valid Reservation",
        startTime: "${tomorrow('6:00')}",
        endTime: "${tomorrow('8:00')}",
        locations: [TableTennis]
      ) {
        id
        recurringId
        name
        customer {
          id
          name
          user {
            id
            email
          }
        }
        startTime
        endTime
        locations
      }
    }`

    const res = await request.post('/').send({ query }).set('Authorization', accessToken).expect(200)

    // TODO: Field resolver for 'customer' and 'user' and 'reservations' -> extendable class
    expect(res.body.data.createReservation.id).toBeTruthy()
    expect(res.body.data.createReservation.recurringId).toBeFalsy()
    expect(res.body.data.createReservation.name).toBe('Valid Reservation')
    expect(res.body.data.createReservation.customer.id).toBe(customer.id)
    expect(res.body.data.createReservation.customer.name).toBe('Foo Bar')
    expect(res.body.data.createReservation.customer.user.id).toBe(user.id)
    expect(res.body.data.createReservation.customer.user.email).toBe('foo@bar.com')
    const startTime = new Date(res.body.data.createReservation.startTime)
    expect(startTime.getTime()).toBe(tomorrow('6:00').getTime())
    const endTime = new Date(res.body.data.createReservation.endTime)
    expect(endTime.getTime()).toBe(tomorrow('8:00').getTime())
    expect(res.body.data.createReservation.locations).toIncludeSameMembers([ReservationLocationEnum.TableTennis])
  })

  it('should persist the reservation to the database', async () => {
    const requestTime = new Date()
    const query = `mutation {
      createReservation(
        name: "Valid Reservation",
        startTime: "${tomorrow('6:00')}",
        endTime: "${tomorrow('8:00')}",
        locations: [TableTennis]
      ) {
        id
        name
        startTime
        endTime
        locations
      }
    }`

    await request.post('/').send({ query }).set('Authorization', accessToken).expect(200)

    const reservationRecords = await prisma.prismaReservation.findMany({ where: { name: 'Valid Reservation' } })
    expect(reservationRecords.length).toBe(1)
    const reservationRecord = reservationRecords[0]
    expect(reservationRecord.id).toBeTruthy()
    expect(reservationRecord.name).toBe('Valid Reservation')
    expect(reservationRecord.isActive).toBe(true)
    expect(reservationRecord.recurringId).toBeFalsy()
    expect(reservationRecord.customerId).toBe(customer.id)
    expect(reservationRecord.startTime.getTime()).toBe(tomorrow('6:00').getTime())
    expect(reservationRecord.endTime.getTime()).toBe(tomorrow('8:00').getTime())
    expect(reservationRecord.tableTennis).toBe(true)
    expect(reservationRecord.badminton).toBe(false)
    expect(reservationRecord.createdAt).toBeAfter(requestTime)
    // TODO: If this passes -> refactor other tests that use 'getTime()'
    expect(reservationRecord.updatedAt).toBe(reservationRecord.createdAt)
  })

  it('should create a reservation if for a multiple locations the IsTimeAvailable use case returns true', async () => {
    const query = `mutation {
      createReservation(
        name: "Valid Reservation",
        startTime: "${tomorrow('6:00')}",
        endTime: "${tomorrow('8:00')}",
        locations: [TableTennis, Badminton]
      ) {
        id
        recurringId
        name
        customer {
          id
          name
          user {
            id
            email
          }
        }
        startTime
        endTime
        locations
      }
    }`

    const res = await request.post('/').send({ query }).set('Authorization', accessToken).expect(200)

    // TODO: Field resolver for 'customer' and 'user' and 'reservations' -> extendable class
    expect(res.body.data.createReservation.id).toBeTruthy()
    expect(res.body.data.createReservation.recurringId).toBeFalsy()
    expect(res.body.data.createReservation.name).toBe('Valid Reservation')
    expect(res.body.data.createReservation.customer.id).toBe(customer.id)
    expect(res.body.data.createReservation.customer.name).toBe('Foo Bar')
    expect(res.body.data.createReservation.customer.user.id).toBe(user.id)
    expect(res.body.data.createReservation.customer.user.email).toBe('foo@bar.com')
    const startTime = new Date(res.body.data.createReservation.startTime)
    expect(startTime.getTime()).toBe(tomorrow('6:00').getTime())
    const endTime = new Date(res.body.data.createReservation.endTime)
    expect(endTime.getTime()).toBe(tomorrow('8:00').getTime())
    expect(res.body.data.createReservation.locations).toIncludeSameMembers([
      ReservationLocationEnum.TableTennis,
      ReservationLocationEnum.Badminton,
    ])
  })

  it('should persist the multi-location reservation to the database', async () => {
    const requestTime = new Date()
    const query = `mutation {
      createReservation(
        name: "Valid Reservation",
        startTime: "${tomorrow('6:00')}",
        endTime: "${tomorrow('8:00')}",
        locations: [TableTennis, Badminton]
      ) {
        id
        name
        startTime
        endTime
        locations
      }
    }`

    await request.post('/').send({ query }).set('Authorization', accessToken).expect(200)

    const reservationRecords = await prisma.prismaReservation.findMany({ where: { name: 'Valid Reservation' } })
    expect(reservationRecords.length).toBe(1)
    const reservationRecord = reservationRecords[0]
    expect(reservationRecord.id).toBeTruthy()
    expect(reservationRecord.name).toBe('Valid Reservation')
    expect(reservationRecord.isActive).toBe(true)
    expect(reservationRecord.recurringId).toBeFalsy()
    expect(reservationRecord.customerId).toBe(customer.id)
    expect(reservationRecord.startTime.getTime()).toBe(tomorrow('6:00').getTime())
    expect(reservationRecord.endTime.getTime()).toBe(tomorrow('8:00').getTime())
    expect(reservationRecord.tableTennis).toBe(true)
    expect(reservationRecord.badminton).toBe(true)
    expect(reservationRecord.createdAt).toBeAfter(requestTime)
    // TODO: If this passes -> refactor other tests that use 'getTime()'
    expect(reservationRecord.updatedAt).toBe(reservationRecord.createdAt)
  })

  it(`should throw a TimeNotAvailableError if 'IsTimeAvailable' returns false`, async () => {
    mocked(IsTimeAvailableUseCase.prototype.execute).mockResolvedValueOnce(Result.ok({ isTimeAvailable: false }))
    const query = `mutation {
      createReservation(
        name: "Invalid Reservation",
        startTime: "${tomorrow('6:00')}",
        endTime: "${tomorrow('8:00')}",
        locations: [TableTennis]
      ) {
        id
        recurringId
        name
        customer {
          id
          name
          user {
            id
            email
          }
        }
        startTime
        endTime
        locations
      }
    }`

    const res = await request.post('/').send({ query }).set('Authorization', accessToken).expect(200)

    // TODO: Field resolver for 'customer' and 'user' and 'reservations' -> extendable class
    expect(res.body.errors[0].extensions.code).toBe('TIME_NOT_AVAILABLE')
    const numOfReservations = await prisma.prismaReservation.count()
    expect(numOfReservations).toBe(0)
  })

  it('should throw an InvalidReservationNameError if the name is shorter than the minimum length', async () => {
    const name = crypto.randomBytes(ReservationName.MIN_NAME_LENGTH - 1).toString('hex')
    const query = `mutation {
      createReservation(
        name: "${name}",
        startTime: "${tomorrow('6:00')}",
        endTime: "${tomorrow('8:00')}",
        locations: [TableTennis]
      ) {
        id
        name
        startTime
        endTime
        locations
      }
    }`

    const res = await request.post('/').send({ query }).set('Authorization', accessToken).expect(200)

    expect(res.body.errors[0].extensions.code).toBe('VALIDATION_ERROR')
    expect(IsTimeAvailableUseCase.prototype.execute).not.toBeCalled()
    const numOfReservations = await prisma.prismaReservation.count()
    expect(numOfReservations).toBe(0)
  })

  it('should throw an InvalidReservationNameError if the name is longer than the maximum length', async () => {
    const name = crypto.randomBytes(ReservationName.MAX_NAME_LENGTH + 1).toString('hex')
    const query = `mutation {
      createReservation(
        name: "${name}",
        startTime: "${tomorrow('6:00')}",
        endTime: "${tomorrow('8:00')}",
        locations: [TableTennis]
      ) {
        id
        name
        startTime
        endTime
        locations
      }
    }`

    const res = await request.post('/').send({ query }).set('Authorization', accessToken).expect(200)

    expect(res.body.errors[0].extensions.code).toBe('VALIDATION_ERROR')
    expect(IsTimeAvailableUseCase.prototype.execute).not.toBeCalled()
    const numOfReservations = await prisma.prismaReservation.count()
    expect(numOfReservations).toBe(0)
  })

  it('should throw an PastTimeError if the reservation starts in the past', async () => {
    const startTime = new Date()
    startTime.setHours(new Date().getHours() - 2)
    const query = `mutation {
      createReservation(
        name: "Invalid Reservation",
        startTime: "${startTime}",
        endTime: "${new Date()}",
        locations: [TableTennis]
      ) {
        id
        name
        startTime
        endTime
        locations
      }
    }`

    const res = await request.post('/').send({ query }).set('Authorization', accessToken).expect(200)

    expect(res.body.errors[0].extensions.code).toBe('PAST_TIME')
    const numOfReservations = await prisma.prismaReservation.count()
    expect(numOfReservations).toBe(0)
  })

  it('should throw an InvalidReservationTimeError if the reservation length exceeds the maximum allowed', async () => {
    const query = `mutation {
      createReservation(
        name: "Invalid Reservation",
        startTime: "${tomorrow('6:00')}",
        endTime: "${tomorrow('10:15')}",
        locations: [TableTennis]
      ) {
        id
        name
        startTime
        endTime
        locations
      }
    }`

    const res = await request.post('/').send({ query }).set('Authorization', accessToken).expect(200)

    expect(res.body.errors[0].extensions.code).toBe('INVALID_TIME_SPAN')
    const numOfReservations = await prisma.prismaReservation.count()
    expect(numOfReservations).toBe(0)
  })

  it('should throw an InvalidReservationTimeError if the reservation length is less than the minimum allowed', async () => {
    const query = `mutation {
      createReservation(
        name: "Invalid Reservation",
        startTime: "${tomorrow('6:00')}",
        endTime: "${tomorrow('6:20')}",
        locations: [TableTennis]
      ) {
        id
        name
        startTime
        endTime
        locations
      }
    }`

    const res = await request.post('/').send({ query }).set('Authorization', accessToken).expect(200)

    expect(res.body.errors[0].extensions.code).toBe('INVALID_TIME_SPAN')
    const numOfReservations = await prisma.prismaReservation.count()
    expect(numOfReservations).toBe(0)
  })

  it('should throw an InvalidOrMissingAccessTokenError if no access token is provided', async () => {
    const query = `mutation {
      createReservation(
        name: "Invalid Reservation",
        startTime: "${tomorrow('6:00')}",
        endTime: "${tomorrow('8:00')}",
        locations: [TableTennis]
      ) {
        id
        name
        startTime
        endTime
        locations
      }
    }`

    const res = await request.post('/').send({ query }).expect(200)

    expect(res.body.errors[0].extensions.code).toBe('INVALID_ACCESS_TOKEN')
    expect(IsTimeAvailableUseCase.prototype.execute).not.toBeCalled()
    const numOfReservations = await prisma.prismaReservation.count()
    expect(numOfReservations).toBe(0)
  })

  it('should throw an InvalidAccessTokenError if the provided access token is invalid', async () => {
    const invalidAccessToken = jwt.sign(
      { userId: user.id, email: user.email } as JwtPayload,
      'DefinitelyNotAValidJwTSecret'
    )
    const query = `mutation {
      createReservation(
        name: "Invalid Reservation",
        startTime: "${tomorrow('6:00')}",
        endTime: "${tomorrow('8:00')}",
        locations: [TableTennis]
      ) {
        id
        name
        startTime
        endTime
        locations
      }
    }`

    const res = await request.post('/').send({ query }).set('Authorization', invalidAccessToken).expect(200)

    expect(res.body.errors[0].extensions.code).toBe('INVALID_ACCESS_TOKEN')
    expect(IsTimeAvailableUseCase.prototype.execute).not.toBeCalled()
    const numOfReservations = await prisma.prismaReservation.count()
    expect(numOfReservations).toBe(0)
  })

  it(`should throw a GraphQL validation error if 'name' is not specified`, async () => {
    const query = `mutation {
      createReservation(
        startTime: "${tomorrow('6:00')}",
        endTime: "${tomorrow('8:00')}",
        locations: [TableTennis]
      ) {
        id
        name
        startTime
        endTime
        locations
      }
    }`

    const res = await request.post('/').send({ query }).set('Authorization', accessToken).expect(400)

    expect(res.body.errors[0].extensions.code).toBe('GRAPHQL_VALIDATION_FAILED')
    expect(IsTimeAvailableUseCase.prototype.execute).not.toBeCalled()
    const numOfReservations = await prisma.prismaReservation.count()
    expect(numOfReservations).toBe(0)
  })

  it(`should throw a GraphQL validation error if 'startTime' is not specified`, async () => {
    const query = `mutation {
      createReservation(
        name: "Valid Reservation",
        endTime: "${tomorrow('8:00')}",
        locations: [TableTennis]
      ) {
        id
        name
        startTime
        endTime
        locations
      }
    }`

    const res = await request.post('/').send({ query }).set('Authorization', accessToken).expect(400)

    expect(res.body.errors[0].extensions.code).toBe('GRAPHQL_VALIDATION_FAILED')
    expect(IsTimeAvailableUseCase.prototype.execute).not.toBeCalled()
    const numOfReservations = await prisma.prismaReservation.count()
    expect(numOfReservations).toBe(0)
  })

  it(`should throw a GraphQL validation error if 'endTime' is not specified`, async () => {
    const query = `mutation {
      createReservation(
        name: "Valid Reservation",
        startTime: "${tomorrow('6:00')}",
        locations: [TableTennis]
      ) {
        id
        name
        startTime
        endTime
        locations
      }
    }`

    const res = await request.post('/').send({ query }).set('Authorization', accessToken).expect(400)

    expect(res.body.errors[0].extensions.code).toBe('GRAPHQL_VALIDATION_FAILED')
    expect(IsTimeAvailableUseCase.prototype.execute).not.toBeCalled()
    const numOfReservations = await prisma.prismaReservation.count()
    expect(numOfReservations).toBe(0)
  })

  it(`should throw a GraphQL validation error if 'locations' is not specified`, async () => {
    const query = `mutation {
      createReservation(
        name: "Valid Reservation",
        startTime: "${tomorrow('6:00')}",
        endTime: "${tomorrow('7:00')}",
      ) {
        id
        name
        startTime
        endTime
        locations
      }
    }`

    const res = await request.post('/').send({ query }).set('Authorization', accessToken).expect(400)

    expect(res.body.errors[0].extensions.code).toBe('GRAPHQL_VALIDATION_FAILED')
    expect(IsTimeAvailableUseCase.prototype.execute).not.toBeCalled()
    const numOfReservations = await prisma.prismaReservation.count()
    expect(numOfReservations).toBe(0)
  })

  it(`should throw a GraphQL validation error if 'locations' is an empty array`, async () => {
    const query = `mutation {
      createReservation(
        name: "Valid Reservation",
        startTime: "${tomorrow('6:00')}",
        endTime: "${tomorrow('7:00')}",
        locations: []
      ) {
        id
        name
        startTime
        endTime
        locations
      }
    }`

    const res = await request.post('/').send({ query }).set('Authorization', accessToken).expect(400)

    expect(res.body.errors[0].extensions.code).toBe('GRAPHQL_VALIDATION_FAILED')
    expect(IsTimeAvailableUseCase.prototype.execute).not.toBeCalled()
    const numOfReservations = await prisma.prismaReservation.count()
    expect(numOfReservations).toBe(0)
  })
})

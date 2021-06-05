import 'reflect-metadata'
import '@modules/reservation'
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
import AreTimesAvailableUseCase from '../areTimesAvailable/AreTimesAvailableUseCase'
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
    jest.spyOn(prisma.prismaReservation, 'count')
    jest.spyOn(AreTimesAvailableUseCase.prototype, 'execute')
    // mocked(AreTimesAvailableUseCase.prototype.execute).mockImplementation(Result.ok({ times: [ { isAvailable: true}]}))
    mocked(AreTimesAvailableUseCase.prototype.execute).mockImplementation(async foo =>
      Result.ok(foo.map(() => ({ isAvailable: true } as any)))
    )
  })

  it('should create a reservation for a single location if the IsTimeAvailable use case returns true', async () => {
    const query = `mutation {
      createReservation(
        name: "Valid Reservation",
        startTime: "${tomorrow('6:00')}",
        endTime: "${tomorrow('8:00')}",
        locations: { tableTennis: true }
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
        locations {
          tableTennis
          badminton
        }
      }
    }`

    const res = await request.post('/').send({ query }).set('Authorization', accessToken)

    expect(res.body.data.createReservation.id).toBeTruthy()
    expect(res.body.data.createReservation.recurringId).toBeFalsy()
    expect(res.body.data.createReservation.name).toBe('Valid Reservation')
    expect(res.body.data.createReservation.customer.id).toBe(customer.id)
    expect(res.body.data.createReservation.customer.name).toBe('Foo Bar')
    expect(res.body.data.createReservation.customer.user.id).toBe(user.id)
    expect(res.body.data.createReservation.customer.user.email).toBe('foo@bar.com')
    const startTime = new Date(res.body.data.createReservation.startTime)
    expect(startTime).toEqual(tomorrow('6:00'))
    const endTime = new Date(res.body.data.createReservation.endTime)
    expect(endTime).toEqual(tomorrow('8:00'))
    expect(res.body.data.createReservation.locations.tableTennis).toBe(true)
    expect(res.body.data.createReservation.locations.badminton).toBe(false)
  })

  it('should persist the reservation to the database', async () => {
    const requestTime = new Date()
    const query = `mutation {
      createReservation(
        name: "Valid Reservation",
        startTime: "${tomorrow('6:00')}",
        endTime: "${tomorrow('8:00')}",
        locations: { tableTennis: true }
      ) {
        id
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
    expect(reservationRecord.startTime).toEqual(tomorrow('6:00'))
    expect(reservationRecord.endTime).toEqual(tomorrow('8:00'))
    expect(reservationRecord.tableTennis).toBe(true)
    expect(reservationRecord.badminton).toBe(false)
    expect(reservationRecord.createdAt).toBeAfter(requestTime)
    expect(reservationRecord.updatedAt).toEqual(reservationRecord.createdAt)
  })

  it('should create a reservation for a multiple locations if the IsTimeAvailable use case returns true', async () => {
    const query = `mutation {
      createReservation(
        name: "Valid Reservation",
        startTime: "${tomorrow('6:00')}",
        endTime: "${tomorrow('8:00')}",
        locations: { tableTennis: true, badminton: true }
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
        locations {
          tableTennis
          badminton
        }
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
    expect(startTime).toEqual(tomorrow('6:00'))
    const endTime = new Date(res.body.data.createReservation.endTime)
    expect(endTime).toEqual(tomorrow('8:00'))
    expect(res.body.data.createReservation.locations.tableTennis).toBe(true)
    expect(res.body.data.createReservation.locations.badminton).toBe(true)
  })

  it('should persist the multi-location reservation to the database', async () => {
    const requestTime = new Date()
    const query = `mutation {
      createReservation(
        name: "Valid Reservation",
        startTime: "${tomorrow('6:00')}",
        endTime: "${tomorrow('8:00')}",
        locations: { tableTennis: true, badminton: true }
      ) {
        id
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
    expect(reservationRecord.startTime).toEqual(tomorrow('6:00'))
    expect(reservationRecord.endTime).toEqual(tomorrow('8:00'))
    expect(reservationRecord.tableTennis).toBe(true)
    expect(reservationRecord.badminton).toBe(true)
    expect(reservationRecord.createdAt).toBeAfter(requestTime)
    expect(reservationRecord.updatedAt).toEqual(reservationRecord.createdAt)
  })

  it(`should throw a TimeNotAvailableError if 'IsTimeAvailable' returns false`, async () => {
    mocked(AreTimesAvailableUseCase.prototype.execute).mockImplementation(async foo =>
      Result.ok(foo.map(() => ({ isAvailable: false } as any)))
    )
    const query = `mutation {
      createReservation(
        name: "Invalid Reservation",
        startTime: "${tomorrow('6:00')}",
        endTime: "${tomorrow('8:00')}",
        locations: { tableTennis: true }
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
      }
    }`

    const res = await request.post('/').send({ query }).set('Authorization', accessToken).expect(200)

    expect(res.body.errors[0].extensions.code).toBe('TIME_NOT_AVAILABLE')
    const numOfReservations = await prisma.prismaReservation.count()
    expect(numOfReservations).toBe(0)
  })

  it('should throw an InvalidReservationNameError if the name is shorter than the minimum length', async () => {
    const name = crypto
      .randomBytes(ReservationName.MIN_NAME_LENGTH - 1)
      .toString('hex')
      .slice(0, ReservationName.MIN_NAME_LENGTH - 1)
    const query = `mutation {
      createReservation(
        name: "${name}",
        startTime: "${tomorrow('6:00')}",
        endTime: "${tomorrow('8:00')}",
        locations: { tableTennis: true }
      ) {
        id
        name
        startTime
        endTime
      }
    }`

    const res = await request.post('/').send({ query }).set('Authorization', accessToken).expect(200)

    expect(res.body.errors[0].extensions.code).toBe('VALIDATION_ERROR')
    expect(AreTimesAvailableUseCase.prototype.execute).not.toBeCalled()
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
        locations: { tableTennis: true }
      ) {
        id
        name
        startTime
        endTime
      }
    }`

    const res = await request.post('/').send({ query }).set('Authorization', accessToken).expect(200)

    expect(res.body.errors[0].extensions.code).toBe('VALIDATION_ERROR')
    expect(AreTimesAvailableUseCase.prototype.execute).not.toBeCalled()
    const numOfReservations = await prisma.prismaReservation.count()
    expect(numOfReservations).toBe(0)
  })

  it('should throw an PastTimeError if the reservation starts in the past', async () => {
    jest.restoreAllMocks()
    const startTime = new Date()
    startTime.setHours(new Date().getHours() - 2)
    const query = `mutation {
      createReservation(
        name: "Invalid Reservation",
        startTime: "${startTime}",
        endTime: "${new Date()}",
        locations: { tableTennis: true }
      ) {
        id
        name
        startTime
        endTime
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
        locations: { tableTennis: true }
      ) {
        id
        name
        startTime
        endTime
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
        locations: { tableTennis: true }
      ) {
        id
        name
        startTime
        endTime
      }
    }`

    const res = await request.post('/').send({ query }).set('Authorization', accessToken).expect(200)

    expect(res.body.errors[0].extensions.code).toBe('INVALID_TIME_SPAN')
    const numOfReservations = await prisma.prismaReservation.count()
    expect(numOfReservations).toBe(0)
  })

  it(`should throw an InvalidReservationTimeError if 'startTime' is later in time than 'endTime'`, async () => {
    const query = `mutation {
      createReservation(
        name: "Invalid Reservation",
        startTime: "${tomorrow('8:00')}",
        endTime: "${tomorrow('6:20')}",
        locations: { tableTennis: true }
      ) {
        id
        name
        startTime
        endTime
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
        locations: { tableTennis: true }
      ) {
        id
        name
        startTime
        endTime
      }
    }`

    const res = await request.post('/').send({ query }).expect(200)

    expect(res.body.errors[0].extensions.code).toBe('INVALID_ACCESS_TOKEN')
    expect(AreTimesAvailableUseCase.prototype.execute).not.toBeCalled()
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
        locations: { tableTennis: true }
      ) {
        id
        name
        startTime
        endTime
      }
    }`

    const res = await request.post('/').send({ query }).set('Authorization', invalidAccessToken).expect(200)

    expect(res.body.errors[0].extensions.code).toBe('INVALID_ACCESS_TOKEN')
    expect(AreTimesAvailableUseCase.prototype.execute).not.toBeCalled()
    const numOfReservations = await prisma.prismaReservation.count()
    expect(numOfReservations).toBe(0)
  })

  it('should throw a InvalidReservationLocationError if both locations are false', async () => {
    const query = `mutation {
      createReservation(
        name: "Invalid Reservation",
        startTime: "${tomorrow('6:00')}",
        endTime: "${tomorrow('8:00')}",
        locations: { tableTennis: false, badminton: false }
      ) {
        id
        name
        startTime
        endTime
      }
    }`

    const res = await request.post('/').send({ query }).set('Authorization', accessToken).expect(200)

    expect(res.body.errors[0].extensions.code).toBe('VALIDATION_ERROR')
    expect(prisma.prismaReservation.count).not.toBeCalled()
  })

  it(`should throw a InvalidReservationLocationError if 'locations' is an empty object`, async () => {
    const query = `mutation {
      createReservation(
        name: "Invalid Reservation",
        startTime: "${tomorrow('6:00')}",
        endTime: "${tomorrow('8:00')}",
        locations: {}
      ) {
        id
        name
        startTime
        endTime
      }
    }`

    const res = await request.post('/').send({ query }).set('Authorization', accessToken).expect(200)

    expect(res.body.errors[0].extensions.code).toBe('VALIDATION_ERROR')
    expect(prisma.prismaReservation.count).not.toBeCalled()
  })

  it(`should throw a GraphQL validation error if 'name' is not specified`, async () => {
    const query = `mutation {
      createReservation(
        startTime: "${tomorrow('6:00')}",
        endTime: "${tomorrow('8:00')}",
        locations: { tableTennis: true }
      ) {
        id
        name
        startTime
        endTime
      }
    }`

    const res = await request.post('/').send({ query }).set('Authorization', accessToken).expect(400)

    expect(res.body.errors[0].extensions.code).toBe('GRAPHQL_VALIDATION_FAILED')
    expect(AreTimesAvailableUseCase.prototype.execute).not.toBeCalled()
    const numOfReservations = await prisma.prismaReservation.count()
    expect(numOfReservations).toBe(0)
  })

  it(`should throw a GraphQL validation error if 'startTime' is not specified`, async () => {
    const query = `mutation {
      createReservation(
        name: "Valid Reservation",
        endTime: "${tomorrow('8:00')}",
        locations: { tableTennis: true }
      ) {
        id
        name
        startTime
        endTime
      }
    }`

    const res = await request.post('/').send({ query }).set('Authorization', accessToken).expect(400)

    expect(res.body.errors[0].extensions.code).toBe('GRAPHQL_VALIDATION_FAILED')
    expect(AreTimesAvailableUseCase.prototype.execute).not.toBeCalled()
    const numOfReservations = await prisma.prismaReservation.count()
    expect(numOfReservations).toBe(0)
  })

  it(`should throw a GraphQL validation error if 'endTime' is not specified`, async () => {
    const query = `mutation {
      createReservation(
        name: "Valid Reservation",
        startTime: "${tomorrow('6:00')}",
        locations: { tableTennis: true }
      ) {
        id
        name
        startTime
        endTime
      }
    }`

    const res = await request.post('/').send({ query }).set('Authorization', accessToken).expect(400)

    expect(res.body.errors[0].extensions.code).toBe('GRAPHQL_VALIDATION_FAILED')
    expect(AreTimesAvailableUseCase.prototype.execute).not.toBeCalled()
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
      }
    }`

    const res = await request.post('/').send({ query }).set('Authorization', accessToken).expect(400)

    expect(res.body.errors[0].extensions.code).toBe('GRAPHQL_VALIDATION_FAILED')
    expect(AreTimesAvailableUseCase.prototype.execute).not.toBeCalled()
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
      }
    }`

    const res = await request.post('/').send({ query }).set('Authorization', accessToken).expect(400)

    expect(res.body.errors[0].extensions.code).toBe('GRAPHQL_VALIDATION_FAILED')
    expect(AreTimesAvailableUseCase.prototype.execute).not.toBeCalled()
    const numOfReservations = await prisma.prismaReservation.count()
    expect(numOfReservations).toBe(0)
  })
})

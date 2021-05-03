import ReservationName from '@modules/reservation/domain/ReservationName'
import { PrismaUser, PrismaCustomer, PrismaReservation } from '@prisma/client'
import { Result } from '@shared/core/Result'
import prisma from '@shared/infra/database/prisma/prisma'
import clearAllData from '@shared/infra/database/prisma/utils/clearAllData'
import { InitializedApolloServer, initApolloServer } from '@shared/infra/http/apollo/initApolloServer'
import supertest from 'supertest'
import { mocked } from 'ts-jest/utils'
import IsRecurringTimeAvailableUseCase from '../isRecurringTimeAvailable/IsRecurringTimeAvailableUseCase'
import crypto from 'crypto'

describe('CreateRecurringReservation Integration', () => {
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

    jest.clearAllMocks()
    jest.spyOn(prisma, '$transaction')
    jest.spyOn(prisma.prismaReservation, 'createMany')
    jest.spyOn(IsRecurringTimeAvailableUseCase.prototype, 'execute')
    Date.now = jest.fn(() => new Date('2021-05-03 10:00:00').getTime())
  })

  it(`should create a recurring reservation based with given properties`, async () => {
    const query = `mutation {
      createRecurringReservation (
        name: "Valid Reservation",
        startTime: "${new Date('2020-05-04 12:00')}",
        endTime: "${new Date('2021-05-04 14:00')}",
        recurrence: Monthly,
        timePeriod: CurrentYear,
        locations: { tableTennis: true }
      ) {
        count
        recurringId
      }
    }`

    const res = await request.post('/').send({ query }).set('Authorization', accessToken).expect(200)

    expect(res.body.data.isRecurringTimeAvailable.availableTimes.length).toBe(6)
    expect(res.body.data.createRecurringReservation.recurringId).toBeTruthy()
  })

  it(`should call the 'IsRecurringTimeAvailable' use case once`, async () => {
    const query = `mutation {
      createRecurringReservation (
        name: "Valid Reservation",
        startTime: "${new Date('2020-05-04 12:00')}",
        endTime: "${new Date('2021-05-04 14:00')}",
        recurrence: Monthly,
        timePeriod: CurrentYear,
        locations: { tableTennis: true }
      ) {
        count
        recurringId
      }
    }`

    await request.post('/').send({ query }).set('Authorization', accessToken).expect(200)

    expect(IsRecurringTimeAvailableUseCase.prototype.execute).toBeCalledTimes(1)
  })

  it(`should throw an error if the 'IsRecurringTimeAvailable' use case fails`, async () => {
    mocked(IsRecurringTimeAvailableUseCase.prototype.execute).mockResolvedValueOnce(Result.fail())
    const query = `mutation {
      createRecurringReservation (
        name: "Valid Reservation",
        startTime: "${new Date('2020-05-04 12:00')}",
        endTime: "${new Date('2021-05-04 14:00')}",
        recurrence: Monthly,
        timePeriod: CurrentYear,
        locations: { tableTennis: true }
      ) {
        count
        recurringId
      }
    }`

    const res = await request.post('/').send({ query }).set('Authorization', accessToken).expect(200)

    expect(res.body.errors[0].extensions.code).toBeTruthy()
    expect(IsRecurringTimeAvailableUseCase.prototype.execute).toBeCalledTimes(1)
    expect(prisma.prismaReservation.create).toBeCalledTimes(0)
  })

  it('should persist the created reservations to the DB', async () => {
    const startTime = new Date('2020-05-04 12:00')
    const query = `mutation {
      createRecurringReservation (
        name: "Valid Reservation",
        startTime: "${startTime}",
        endTime: "${new Date('2021-05-04 14:00')}",
        recurrence: Monthly,
        timePeriod: CurrentYear,
        locations: { tableTennis: true }
      ) {
        count
        recurringId
      }
    }`

    await request.post('/').send({ query }).set('Authorization', accessToken).expect(200)

    const reservations = await prisma.prismaReservation.findMany()
    expect(reservations.length).toBe(8)
    const reservationStartTimes = reservations.map(reservation => reservation.startTime)
    const dates = [...Array(6).keys()].map((_, index) => {
      const date = new Date(startTime)
      date.setMonth(startTime.getMonth() + index)
      return date.toJSON()
    })
    expect(reservationStartTimes).toIncludeAllMembers(dates)
    expect(reservations).toSatisfyAll((reservation: PrismaReservation) => reservation.name === 'Valid Reservation')
  })

  it('should only make one call to the DB to persist the created reservation', async () => {
    const query = `mutation {
      createRecurringReservation (
        name: "Valid Reservation",
        startTime: "${new Date('2020-05-04 12:00')}",
        endTime: "${new Date('2021-05-04 14:00')}",
        recurrence: Monthly,
        timePeriod: CurrentYear,
        locations: { tableTennis: true }
      ) {
        count
        recurringId
      }
    }`

    await request.post('/').send({ query }).set('Authorization', accessToken).expect(200)

    expect(prisma.$transaction).toBeCalledTimes(1)
    expect(prisma.prismaReservation.createMany).toBeCalledTimes(1)
  })

  it(`should assign the same 'recurringId' to all created reservations in the DB`, async () => {
    const query = `mutation {
      createRecurringReservation (
        name: "Valid Reservation",
        startTime: "${new Date('2020-05-04 12:00')}",
        endTime: "${new Date('2021-05-04 14:00')}",
        recurrence: Monthly,
        timePeriod: CurrentYear,
        locations: { tableTennis: true }
      ) {
        count
        recurringId
      }
    }`

    await request.post('/').send({ query }).set('Authorization', accessToken).expect(200)

    const reservations = await prisma.prismaReservation.findMany()
    expect(reservations[0].recurringId).toBeTruthy()
    const { recurringId } = reservations[0]
    expect(reservations).toSatisfyAll((reservation: PrismaReservation) => reservation.recurringId === recurringId)
  })

  it(`should create a recurring reservation for multiple locations`, async () => {
    const query = `mutation {
      createRecurringReservation (
        name: "Valid Reservation",
        startTime: "${new Date('2020-05-04 12:00')}",
        endTime: "${new Date('2021-05-04 14:00')}",
        recurrence: Weekly,
        timePeriod: HalfYear,
        locations: { tableTennis: true, badminton: true }
      ) {
        count
        recurringId
      }
    }`

    const res = await request.post('/').send({ query }).set('Authorization', accessToken).expect(200)

    expect(res.body.data.createRecurringReservation.count).toBe(35)
    expect(res.body.data.createRecurringReservation.recurringId).toBeTruthy()
  })

  it('should persist the multi-location reservation to the DB', async () => {
    const startTime = new Date('2020-05-04 12:00')
    const query = `mutation {
      createRecurringReservation (
        name: "Valid Reservation",
        startTime: "${startTime}",
        endTime: "${new Date('2021-05-04 14:00')}",
        recurrence: Weekly,
        timePeriod: HalfYear,
        locations: { tableTennis: true, badminton: true }
      ) {
        count
      }
    }`

    await request.post('/').send({ query }).set('Authorization', accessToken).expect(200)

    const reservations = await prisma.prismaReservation.findMany()
    expect(reservations.length).toBe(35)
    const reservationStartTimes = reservations.map(reservation => reservation.startTime)
    const dates = [...Array(35).keys()].map((_, index) => {
      const date = new Date(startTime)
      date.setDate(date.getDate() + index * 7)
      return date.toJSON()
    })
    expect(reservationStartTimes).toIncludeAllMembers(dates)
    expect(reservations).toSatisfyAll((reservation: PrismaReservation) => reservation.name === 'Valid Reservation')
    expect(reservations).toSatisfyAll((reservation: PrismaReservation) => reservation.badminton === true)
    expect(reservations).toSatisfyAll((reservation: PrismaReservation) => reservation.tableTennis === true)
  })

  it('should throw an InvalidOrMissingAccessTokenError if no access token is provided', async () => {
    const query = `mutation {
      createRecurringReservation (
        name: "Valid Reservation",
        startTime: "${new Date('2020-05-04 12:00')}",
        endTime: "${new Date('2021-05-04 14:00')}",
        recurrence: Weekly,
        timePeriod: HalfYear,
        locations: { tableTennis: true, badminton: true }
      ) {
        count
        recurringId
      }
    }`

    const res = await request.post('/').send({ query }).expect(200)

    expect(res.body.errors[0].extensions.code).toBe('INVALID_ACCESS_TOKEN')
    expect(IsRecurringTimeAvailableUseCase.prototype.execute).not.toBeCalled()
    expect(prisma.$transaction).not.toBeCalled()
    expect(prisma.prismaReservation.createMany).not.toBeCalled()
    const numOfReservations = await prisma.prismaReservation.count()
    expect(numOfReservations).toBe(0)
  })

  it(`should throw an InvalidReservationNameError if the 'name' is shorter than the minimum length`, async () => {
    const name = crypto
      .randomBytes(ReservationName.MIN_NAME_LENGTH - 1)
      .toString('hex')
      .slice(0, ReservationName.MIN_NAME_LENGTH - 1)
    const query = `mutation {
      createRecurringReservation (
        name: "${name}",
        startTime: "${new Date('2020-05-04 12:00')}",
        endTime: "${new Date('2021-05-04 14:00')}",
        recurrence: Weekly,
        timePeriod: HalfYear,
        locations: { tableTennis: true, badminton: true }
      ) {
        count
        recurringId
      }
    }`

    const res = await request.post('/').send({ query }).set('Authorization', accessToken).expect(200)

    expect(res.body.errors[0].extensions.code).toBe('VALIDATION_ERROR')
    expect(IsRecurringTimeAvailableUseCase.prototype.execute).not.toBeCalled()
    expect(prisma.$transaction).not.toBeCalled()
    expect(prisma.prismaReservation.createMany).not.toBeCalled()
    const numOfReservations = await prisma.prismaReservation.count()
    expect(numOfReservations).toBe(0)
  })

  it(`should throw an InvalidReservationNameError if the 'name' is longer than the maximum length`, async () => {
    const name = crypto.randomBytes(ReservationName.MAX_NAME_LENGTH + 1).toString('hex')
    const query = `mutation {
      createRecurringReservation (
        name: "${name}",
        startTime: "${new Date('2020-05-04 12:00')}",
        endTime: "${new Date('2021-05-04 14:00')}",
        recurrence: Weekly,
        timePeriod: HalfYear,
        locations: { tableTennis: true, badminton: true }
      ) {
        count
        recurringId
      }
    }`

    const res = await request.post('/').send({ query }).set('Authorization', accessToken).expect(200)

    expect(res.body.errors[0].extensions.code).toBe('VALIDATION_ERROR')
    expect(IsRecurringTimeAvailableUseCase.prototype.execute).not.toBeCalled()
    expect(prisma.$transaction).not.toBeCalled()
    expect(prisma.prismaReservation.createMany).not.toBeCalled()
    const numOfReservations = await prisma.prismaReservation.count()
    expect(numOfReservations).toBe(0)
  })

  it('should throw an PastTimeError if the reservation starts in the past', async () => {
    const query = `mutation {
      createRecurringReservation (
        name: "Past Reservation",
        startTime: "${new Date('2020-05-02 12:00')}",
        endTime: "${new Date('2021-05-02 14:00')}",
        recurrence: Weekly,
        timePeriod: HalfYear,
        locations: { tableTennis: true }
      ) {
        count
        recurringId
      }
    }`

    const res = await request.post('/').send({ query }).set('Authorization', accessToken).expect(200)

    expect(res.body.errors[0].extensions.code).toBe('VALIDATION_ERROR')
    expect(IsRecurringTimeAvailableUseCase.prototype.execute).not.toBeCalled()
    expect(prisma.$transaction).not.toBeCalled()
    expect(prisma.prismaReservation.createMany).not.toBeCalled()
    const numOfReservations = await prisma.prismaReservation.count()
    expect(numOfReservations).toBe(0)
  })

  it('should throw an InvalidReservationTimeError if the reservation length is less than the minimum allowed', async () => {
    const query = `mutation {
      createRecurringReservation (
        name: "Past Reservation",
        startTime: "${new Date('2020-05-04 12:00')}",
        endTime: "${new Date('2021-05-04 12:20')}",
        recurrence: Weekly,
        timePeriod: HalfYear,
        locations: { tableTennis: true }
      ) {
        count
        recurringId
      }
    }`

    const res = await request.post('/').send({ query }).set('Authorization', accessToken).expect(200)

    expect(res.body.errors[0].extensions.code).toBe('INVALID_TIME_SPAN')
    expect(IsRecurringTimeAvailableUseCase.prototype.execute).not.toBeCalled()
    expect(prisma.$transaction).not.toBeCalled()
    expect(prisma.prismaReservation.createMany).not.toBeCalled()
    const numOfReservations = await prisma.prismaReservation.count()
    expect(numOfReservations).toBe(0)
  })

  it('should throw an InvalidReservationTimeError if the reservation length exceeds the maximum allowed', async () => {
    const query = `mutation {
      createRecurringReservation (
        name: "Past Reservation",
        startTime: "${new Date('2020-05-04 10:00')}",
        endTime: "${new Date('2021-05-04 16:20')}",
        recurrence: Weekly,
        timePeriod: HalfYear,
        locations: { tableTennis: true }
      ) {
        count
        recurringId
      }
    }`

    const res = await request.post('/').send({ query }).set('Authorization', accessToken).expect(200)

    expect(res.body.errors[0].extensions.code).toBe('INVALID_TIME_SPAN')
    expect(IsRecurringTimeAvailableUseCase.prototype.execute).not.toBeCalled()
    expect(prisma.$transaction).not.toBeCalled()
    expect(prisma.prismaReservation.createMany).not.toBeCalled()
    const numOfReservations = await prisma.prismaReservation.count()
    expect(numOfReservations).toBe(0)
  })

  it(`should throw an InvalidReservationTimeError if 'startTime' is later in time than 'endTime'`, async () => {
    const query = `mutation {
      createRecurringReservation (
        name: "Past Reservation",
        startTime: "${new Date('2020-05-04 12:00')}",
        endTime: "${new Date('2021-05-04 11:20')}",
        recurrence: Weekly,
        timePeriod: HalfYear,
        locations: { tableTennis: true }
      ) {
        count
        recurringId
      }
    }`

    const res = await request.post('/').send({ query }).set('Authorization', accessToken).expect(200)

    expect(res.body.errors[0].extensions.code).toBe('INVALID_TIME_SPAN')
    expect(IsRecurringTimeAvailableUseCase.prototype.execute).not.toBeCalled()
    expect(prisma.$transaction).not.toBeCalled()
    expect(prisma.prismaReservation.createMany).not.toBeCalled()
    const numOfReservations = await prisma.prismaReservation.count()
    expect(numOfReservations).toBe(0)
  })

  it('should throw a InvalidReservationLocationError if both locations are false', async () => {
    const query = `mutation {
      createRecurringReservation (
        name: "Past Reservation",
        startTime: "${new Date('2020-05-04 12:00')}",
        endTime: "${new Date('2021-05-04 13:20')}",
        recurrence: Weekly,
        timePeriod: HalfYear,
        locations: { tableTennis: false, badminton: false }
      ) {
        count
        recurringId
      }
    }`

    const res = await request.post('/').send({ query }).set('Authorization', accessToken).expect(200)

    expect(res.body.errors[0].extensions.code).toBe('VALIDATION_ERROR')
    expect(IsRecurringTimeAvailableUseCase.prototype.execute).not.toBeCalled()
    expect(prisma.$transaction).not.toBeCalled()
    expect(prisma.prismaReservation.createMany).not.toBeCalled()
    const numOfReservations = await prisma.prismaReservation.count()
    expect(numOfReservations).toBe(0)
  })

  it(`should throw a InvalidReservationLocationError if 'locations' is an empty object`, async () => {
    const query = `mutation {
      createRecurringReservation (
        name: "Past Reservation",
        startTime: "${new Date('2020-05-04 12:00')}",
        endTime: "${new Date('2021-05-04 13:20')}",
        recurrence: Weekly,
        timePeriod: HalfYear,
        locations: { }
      ) {
        count
        recurringId
      }
    }`

    const res = await request.post('/').send({ query }).set('Authorization', accessToken).expect(200)

    expect(res.body.errors[0].extensions.code).toBe('VALIDATION_ERROR')
    expect(IsRecurringTimeAvailableUseCase.prototype.execute).not.toBeCalled()
    expect(prisma.$transaction).not.toBeCalled()
    expect(prisma.prismaReservation.createMany).not.toBeCalled()
    const numOfReservations = await prisma.prismaReservation.count()
    expect(numOfReservations).toBe(0)
  })

  it(`should throw a GraphQL validation error if the 'name' argument is not specified`, async () => {
    const query = `mutation {
      createRecurringReservation (
        startTime: "${new Date('2020-05-04 12:00')}",
        endTime: "${new Date('2021-05-04 13:20')}",
        recurrence: Weekly,
        timePeriod: HalfYear,
        locations: { tableTennis: false, badminton: false }
      ) {
        count
        recurringId
      }
    }`

    const res = await request.post('/').send({ query }).set('Authorization', accessToken).expect(400)

    expect(res.body.errors[0].extensions.code).toBe('GRAPHQL_VALIDATION_FAILED')
    expect(IsRecurringTimeAvailableUseCase.prototype.execute).not.toBeCalled()
    expect(prisma.$transaction).not.toBeCalled()
    expect(prisma.prismaReservation.createMany).not.toBeCalled()
    const numOfReservations = await prisma.prismaReservation.count()
    expect(numOfReservations).toBe(0)
  })

  it(`should throw a GraphQL validation error if the 'startTime' argument is not specified`, async () => {
    const query = `mutation {
      createRecurringReservation (
        name: "Invalid Reservation",
        endTime: "${new Date('2021-05-04 13:20')}",
        recurrence: Weekly,
        timePeriod: HalfYear,
        locations: { tableTennis: false, badminton: false }
      ) {
        count
        recurringId
      }
    }`

    const res = await request.post('/').send({ query }).set('Authorization', accessToken).expect(400)

    expect(res.body.errors[0].extensions.code).toBe('GRAPHQL_VALIDATION_FAILED')
    expect(IsRecurringTimeAvailableUseCase.prototype.execute).not.toBeCalled()
    expect(prisma.$transaction).not.toBeCalled()
    expect(prisma.prismaReservation.createMany).not.toBeCalled()
    const numOfReservations = await prisma.prismaReservation.count()
    expect(numOfReservations).toBe(0)
  })

  it(`should throw a GraphQL validation error if the 'endTime' argument is not specified`, async () => {
    const query = `mutation {
      createRecurringReservation (
        name: "Invalid Reservation",
        startTime: "${new Date('2021-05-04 13:20')}",
        recurrence: Weekly,
        timePeriod: HalfYear,
        locations: { tableTennis: false, badminton: false }
      ) {
        count
        recurringId
      }
    }`

    const res = await request.post('/').send({ query }).set('Authorization', accessToken).expect(400)

    expect(res.body.errors[0].extensions.code).toBe('GRAPHQL_VALIDATION_FAILED')
    expect(IsRecurringTimeAvailableUseCase.prototype.execute).not.toBeCalled()
    expect(prisma.$transaction).not.toBeCalled()
    expect(prisma.prismaReservation.createMany).not.toBeCalled()
    const numOfReservations = await prisma.prismaReservation.count()
    expect(numOfReservations).toBe(0)
  })

  it(`should throw a GraphQL validation error if the 'locations' argument is not specified`, async () => {
    const query = `mutation {
      createRecurringReservation (
        name: "Invalid Reservation",
        startTime: "${new Date('2021-05-04 12:20')}",
        endTime: "${new Date('2021-05-04 13:20')}",
        recurrence: Weekly,
        timePeriod: HalfYear,
      ) {
        count
        recurringId
      }
    }`

    const res = await request.post('/').send({ query }).set('Authorization', accessToken).expect(400)

    expect(res.body.errors[0].extensions.code).toBe('GRAPHQL_VALIDATION_FAILED')
    expect(IsRecurringTimeAvailableUseCase.prototype.execute).not.toBeCalled()
    expect(prisma.$transaction).not.toBeCalled()
    expect(prisma.prismaReservation.createMany).not.toBeCalled()
    const numOfReservations = await prisma.prismaReservation.count()
    expect(numOfReservations).toBe(0)
  })

  it(`should use the 'HalfYear' value if no 'timePeriod' argument is specified`, async () => {
    const query = `mutation {
      createRecurringReservation (
        name: "Valid Reservation",
        startTime: "${new Date('2020-05-04 12:00')}",
        endTime: "${new Date('2021-05-04 14:00')}",
        recurrence: Monthly,
        locations: { tableTennis: true }
      ) {
        count
        recurringId
      }
    }`

    const res = await request.post('/').send({ query }).set('Authorization', accessToken).expect(200)

    expect(res.body.data.isRecurringTimeAvailable.availableTimes.length).toBe(6)
    expect(res.body.data.createRecurringReservation.recurringId).toBeTruthy()
  })

  it(`should use the 'Weekly' value if no 'recurrence' argument is specified`, async () => {
    const query = `mutation {
      createRecurringReservation (
        name: "Valid Reservation",
        startTime: "${new Date('2020-05-04 12:00')}",
        endTime: "${new Date('2021-05-04 14:00')}",
        timePeriod: CurrentYear,
        locations: { tableTennis: true }
      ) {
        count
        recurringId
      }
    }`

    const res = await request.post('/').send({ query }).set('Authorization', accessToken).expect(200)

    expect(res.body.data.isRecurringTimeAvailable.availableTimes.length).toBe(35)
    expect(res.body.data.createRecurringReservation.recurringId).toBeTruthy()
  })

  it('should throw a TimeNotAvailableError if at least one of the dates is not available', async () => {
    mocked(IsRecurringTimeAvailableUseCase.prototype.execute).mockResolvedValueOnce(
      Result.ok({ availableTimes: [new Date()], unavailableTimes: [new Date('2021-05-12 12:00')] })
    )
    const query = `mutation {
      createRecurringReservation (
        name: "Valid Reservation",
        startTime: "${new Date('2020-05-04 12:00')}",
        endTime: "${new Date('2021-05-04 14:00')}",
        timePeriod: CurrentYear,
        recurrence: Weekly,
        locations: { tableTennis: true }
      ) {
        count
        recurringId
      }
    }`

    const res = await request.post('/').send({ query }).set('Authorization', accessToken).expect(200)

    expect(res.body.errors[0].extensions.code).toBe('TIME_NOT_AVAILABLE')
    expect(IsRecurringTimeAvailableUseCase.prototype.execute).toBeCalledTimes(1)
    expect(prisma.prismaReservation.createMany).not.toBeCalled()
    const numOfReservations = await prisma.prismaReservation.count()
    expect(numOfReservations).toBe(0)
  })
})

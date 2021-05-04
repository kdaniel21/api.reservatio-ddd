import 'reflect-metadata'
import '@modules/reservation'
import ReservationTime from '@modules/reservation/domain/ReservationTime'
import { PrismaUser, PrismaCustomer } from '@prisma/client'
import UniqueID from '@shared/domain/UniqueID'
import prisma from '@shared/infra/database/prisma/prisma'
import clearAllData from '@shared/infra/database/prisma/utils/clearAllData'
import { InitializedApolloServer, initApolloServer } from '@shared/infra/http/apollo/initApolloServer'
import supertest from 'supertest'
import crypto from 'crypto'
import jwt from 'jsonwebtoken'
import { JwtPayload } from '@modules/users/domain/AccessToken'
import config from '@config'

describe('IsRecurringTimeAvailable', () => {
  let initializedServer: InitializedApolloServer
  let request: supertest.SuperTest<supertest.Test>

  let user: PrismaUser
  let customer: PrismaCustomer
  let accessToken: string

  beforeAll(async () => {
    initializedServer = await initApolloServer()
    request = supertest(initializedServer.serverInfo.url)
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
    jest.spyOn(prisma, '$transaction')
    Date.now = jest.fn(() => new Date('2021-05-03 10:00:00').getTime())
  })

  afterAll(async () => {
    await initializedServer.apolloServer.stop()
  })

  it(`should calculate all dates with a weekly recurrence for the current year and return as available if 
  there are no other reservations`, async () => {
    await clearAllData()
    const startTime = new Date('2021-05-04 11:00')
    const query = `query {
      isRecurringTimeAvailable(
        startTime: "${startTime}",
        endTime: "${new Date('2021-05-04 13:00')}",
        recurrence: Weekly,
        timePeriod: CurrentYear,
        locations: { tableTennis: true }
      ) {
        availableTimes
        unavailableTimes
      }
    }`

    const res = await request.post('/').send({ query }).set('Authorization', accessToken).expect(200)

    expect(res.body.data.isRecurringTimeAvailable.availableTimes.length).toBe(35)
    expect(res.body.data.isRecurringTimeAvailable.unavailableTimes.length).toBe(0)
    const dates = [...Array(35).keys()].map((_, index) => {
      const date = new Date(startTime)
      date.setDate(date.getDate() + index * 7)
      return date.toJSON()
    })
    expect(res.body.data.isRecurringTimeAvailable.availableTimes).toIncludeAllMembers(dates)
  })

  it(`should calculate all dates with a weekly recurrence for half a year and return as available if 
  there are no other reservations`, async () => {
    await clearAllData()
    const startTime = new Date('2021-05-04 11:00')
    const query = `query {
      isRecurringTimeAvailable(
        startTime: "${startTime}",
        endTime: "${new Date('2021-05-04 13:00')}",
        recurrence: Weekly,
        timePeriod: HalfYear,
        locations: { tableTennis: true }
      ) {
        availableTimes
        unavailableTimes
      }
    }`

    const res = await request.post('/').send({ query }).set('Authorization', accessToken).expect(200)

    expect(res.body.data.isRecurringTimeAvailable.availableTimes.length).toBe(27)
    expect(res.body.data.isRecurringTimeAvailable.unavailableTimes.length).toBe(0)
    const dates = [...Array(27).keys()].map((_, index) => {
      const date = new Date(startTime)
      date.setDate(date.getDate() + index * 7)
      return date.toJSON()
    })
    expect(res.body.data.isRecurringTimeAvailable.availableTimes).toIncludeAllMembers(dates)
  })

  it(`should calculate all dates with a monthly recurrence for the current year and return as available if 
  there are no other reservations`, async () => {
    await clearAllData()
    const startTime = new Date('2021-05-04 11:00')
    const query = `query {
      isRecurringTimeAvailable(
        startTime: "${startTime}",
        endTime: "${new Date('2021-05-04 13:00')}",
        recurrence: Monthly,
        timePeriod: CurrentYear,
        locations: { tableTennis: true }
      ) {
        availableTimes
        unavailableTimes
      }
    }`

    const res = await request.post('/').send({ query }).set('Authorization', accessToken).expect(200)

    expect(res.body.data.isRecurringTimeAvailable.availableTimes.length).toBe(8)
    expect(res.body.data.isRecurringTimeAvailable.unavailableTimes.length).toBe(0)
    const dates = [...Array(6).keys()].map((_, index) => {
      const date = new Date(startTime)
      date.setMonth(startTime.getMonth() + index)
      return date.toJSON()
    })
    expect(res.body.data.isRecurringTimeAvailable.availableTimes).toIncludeAllMembers(dates)
  })

  it(`should calculate all dates with a monthly recurrence for half a year and return as available if 
  there are no other reservations`, async () => {
    await clearAllData()
    const startTime = new Date('2021-05-04 11:00')
    const query = `query {
      isRecurringTimeAvailable(
        startTime: "${startTime}",
        endTime: "${new Date('2021-05-04 13:00')}",
        recurrence: Monthly,
        timePeriod: HalfYear,
        locations: { tableTennis: true }
      ) {
        availableTimes
        unavailableTimes
      }
    }`

    const res = await request.post('/').send({ query }).set('Authorization', accessToken).expect(200)

    expect(res.body.data.isRecurringTimeAvailable.availableTimes.length).toBe(6)
    expect(res.body.data.isRecurringTimeAvailable.unavailableTimes.length).toBe(0)
    const dates = [...Array(6).keys()].map((_, index) => {
      const date = new Date(startTime)
      date.setMonth(startTime.getMonth() + index)
      return date.toJSON()
    })
    expect(res.body.data.isRecurringTimeAvailable.availableTimes).toIncludeAllMembers(dates)
  })

  it('should return the not available times for a period with given recurrence', async () => {
    await prisma.prismaReservation.create({
      data: {
        id: new UniqueID().toString(),
        customerId: customer.id,
        name: 'Single Reservation 1',
        startTime: new Date('2021-07-04 11:15'),
        endTime: new Date('2021-07-04 12:15'),
        tableTennis: true,
      },
    })
    const startTime = new Date('2021-05-04 11:00')
    const query = `query {
      isRecurringTimeAvailable(
        startTime: "${startTime}",
        endTime: "${new Date('2021-05-04 13:00')}",
        recurrence: Monthly,
        timePeriod: HalfYear,
        locations: { tableTennis: true }
      ) {
        availableTimes
        unavailableTimes
      }
    }`

    const res = await request.post('/').send({ query }).set('Authorization', accessToken).expect(200)

    expect(res.body.data.isRecurringTimeAvailable.availableTimes.length).toBe(5)
    expect(res.body.data.isRecurringTimeAvailable.unavailableTimes.length).toBe(1)
    expect(res.body.data.isRecurringTimeAvailable.unavailableTimes[0]).toEqual(new Date('2021-07-04 11:00').toJSON())
    const dates = [...Array(6).keys()]
      .map((_, index) => {
        const date = new Date(startTime)
        date.setMonth(startTime.getMonth() + index)
        return date.toJSON()
      })
      .filter(date => date !== new Date('2021-07-04 11:00').toJSON())
    expect(res.body.data.isRecurringTimeAvailable.availableTimes).toIncludeAllMembers(dates)
  })

  it('should all calculated times as valid if it only collides with a reservation for a different location', async () => {
    await prisma.prismaReservation.create({
      data: {
        id: new UniqueID().toString(),
        customerId: customer.id,
        name: 'Single Reservation 1',
        startTime: new Date('2021-07-04 11:15'),
        endTime: new Date('2021-07-04 12:15'),
        badminton: true,
      },
    })
    const startTime = new Date('2021-05-04 11:00')
    const query = `query {
      isRecurringTimeAvailable(
        startTime: "${startTime}",
        endTime: "${new Date('2021-05-04 13:00')}",
        recurrence: Monthly,
        timePeriod: HalfYear,
        locations: { tableTennis: true }
      ) {
        availableTimes
        unavailableTimes
      }
    }`

    const res = await request.post('/').send({ query }).set('Authorization', accessToken).expect(200)

    expect(res.body.data.isRecurringTimeAvailable.availableTimes.length).toBe(6)
    expect(res.body.data.isRecurringTimeAvailable.unavailableTimes.length).toBe(0)
    const dates = [...Array(6).keys()].map((_, index) => {
      const date = new Date(startTime)
      date.setMonth(startTime.getMonth() + index)
      return date.toJSON()
    })
    expect(res.body.data.isRecurringTimeAvailable.availableTimes).toIncludeAllMembers(dates)
  })

  it('should not validate the excluded dates', async () => {
    await prisma.prismaReservation.create({
      data: {
        id: new UniqueID().toString(),
        customerId: customer.id,
        name: 'Single Reservation 1',
        startTime: new Date('2021-07-04 11:15'),
        endTime: new Date('2021-07-04 12:15'),
        tableTennis: true,
      },
    })
    const startTime = new Date('2021-05-04 11:00')
    const query = `query {
      isRecurringTimeAvailable(
        startTime: "${startTime}",
        endTime: "${new Date('2021-05-04 13:00')}",
        recurrence: Monthly,
        timePeriod: HalfYear,
        excludedDates: ["${new Date('2021-07-04 11:00')}"]
        locations: { tableTennis: true }
      ) {
        availableTimes
        unavailableTimes
      }
    }`

    const res = await request.post('/').send({ query }).set('Authorization', accessToken).expect(200)

    expect(res.body.data.isRecurringTimeAvailable.availableTimes.length).toBe(5)
    expect(res.body.data.isRecurringTimeAvailable.unavailableTimes.length).toBe(0)
    const dates = [...Array(6).keys()]
      .map((_, index) => {
        const date = new Date(startTime)
        date.setMonth(startTime.getMonth() + index)
        return date.toJSON()
      })
      .filter(date => date !== new Date('2021-07-04 11:00').toJSON())
    expect(res.body.data.isRecurringTimeAvailable.availableTimes).toIncludeAllMembers(dates)
  })

  it('should include the included dates into the validation', async () => {
    const startTime = new Date('2021-05-04 11:00')
    const query = `query {
      isRecurringTimeAvailable(
        startTime: "${startTime}",
        endTime: "${new Date('2021-05-04 13:00')}",
        recurrence: Monthly,
        timePeriod: HalfYear,
        includedDates: ["${new Date('2021-05-06 11:00')}"]
        locations: { tableTennis: true }
      ) {
        availableTimes
        unavailableTimes
      }
    }`

    const res = await request.post('/').send({ query }).set('Authorization', accessToken).expect(200)

    expect(res.body.data.isRecurringTimeAvailable.availableTimes.length).toBe(7)
    expect(res.body.data.isRecurringTimeAvailable.unavailableTimes.length).toBe(0)
    const dates = [...Array(6).keys()].map((_, index) => {
      const date = new Date(startTime)
      date.setMonth(startTime.getMonth() + index)
      return date.toJSON()
    })
    expect(res.body.data.isRecurringTimeAvailable.availableTimes).toIncludeAllMembers([
      ...dates,
      new Date('2021-05-06 11:00').toJSON(),
    ])
  })

  it('should make only one request to the database', async () => {
    const query = `query {
      isRecurringTimeAvailable(
        startTime: "${new Date('2021-05-04 11:00')}",
        endTime: "${new Date('2021-05-04 13:00')}",
        recurrence: Monthly,
        timePeriod: HalfYear,
        locations: { tableTennis: true }
      ) {
        availableTimes
        unavailableTimes
      }
    }`

    const res = await request.post('/').send({ query }).set('Authorization', accessToken).expect(200)

    expect(res.body.data.isRecurringTimeAvailable.availableTimes.length).toBe(6)
    expect(res.body.data.isRecurringTimeAvailable.unavailableTimes.length).toBe(0)
    expect(prisma.$transaction).toBeCalledTimes(1)
  })

  it(`should throw a InvalidReservationTimeError if the difference between 'startTime' and 'endTime' exceeds the maximum time frame`, async () => {
    const startTime = new Date('2021-05-04 11:00')
    const endTime = new Date(startTime)
    endTime.setHours(endTime.getHours() + ReservationTime.MAX_RESERVATION_HOURS + 1)
    const query = `query {
      isRecurringTimeAvailable(
        startTime: "${startTime}",
        endTime: "${endTime}",
        recurrence: Monthly,
        timePeriod: HalfYear,
        locations: { tableTennis: true }
      ) {
        availableTimes
        unavailableTimes
      }
    }`

    const res = await request.post('/').send({ query }).set('Authorization', accessToken).expect(200)

    expect(res.body.errors[0].extensions.code).toBe('INVALID_TIME_SPAN')
    expect(prisma.$transaction).toBeCalledTimes(0)
  })

  it(`should throw a InvalidReservationTimeError if the difference between 'startTime' and 'endTime' is less than the minimum time frame`, async () => {
    const startTime = new Date('2021-05-04 11:00')
    const endTime = new Date(startTime)
    endTime.setHours(endTime.getHours() + ReservationTime.MIN_RESERVATION_HOURS - 0.25)
    const query = `query {
      isRecurringTimeAvailable(
        startTime: "${startTime}",
        endTime: "${endTime}",
        recurrence: Monthly,
        timePeriod: HalfYear,
        locations: { tableTennis: true }
      ) {
        availableTimes
        unavailableTimes
      }
    }`

    const res = await request.post('/').send({ query }).set('Authorization', accessToken).expect(200)

    expect(res.body.errors[0].extensions.code).toBe('INVALID_TIME_SPAN')
    expect(prisma.$transaction).toBeCalledTimes(0)
  })

  it('should throw an InvalidOrMissingAccessTokenError if no access token is provided', async () => {
    const query = `query {
      isRecurringTimeAvailable(
        startTime: "${new Date('2021-05-04 12:00')}",
        endTime: "${new Date('2021-05-04 14:00')}",
        recurrence: Monthly,
        timePeriod: HalfYear,
        locations: { tableTennis: true }
      ) {
        availableTimes
        unavailableTimes
      }
    }`

    const res = await request.post('/').send({ query }).expect(200)

    expect(res.body.errors[0].extensions.code).toBe('INVALID_ACCESS_TOKEN')
    expect(prisma.$transaction).toBeCalledTimes(0)
  })

  it('should throw an InvalidReservationLocationError if both locations are false', async () => {
    const query = `query {
      isRecurringTimeAvailable(
        startTime: "${new Date('2021-05-04 12:00')}",
        endTime: "${new Date('2021-05-04 14:00')}",
        recurrence: Monthly,
        timePeriod: HalfYear,
        locations: { tableTennis: false, badminton: false }
      ) {
        availableTimes
        unavailableTimes
      }
    }`

    const res = await request.post('/').send({ query }).set('Authorization', accessToken).expect(200)

    expect(res.body.errors[0].extensions.code).toBe('VALIDATION_ERROR')
    expect(prisma.$transaction).toBeCalledTimes(0)
  })

  it(`should throw a GraphQL validation error if there is no 'startTime' argument`, async () => {
    const query = `query {
      isRecurringTimeAvailable(
        endTime: "${new Date('2021-05-04 14:00')}",
        recurrence: Monthly,
        timePeriod: HalfYear,
        locations: { tableTennis: true }
      ) {
        availableTimes
        unavailableTimes
      }
    }`

    const res = await request.post('/').send({ query }).expect(400)

    expect(res.body.errors[0].extensions.code).toBe('GRAPHQL_VALIDATION_FAILED')
    expect(prisma.$transaction).toBeCalledTimes(0)
  })

  it(`should throw a GraphQL validation error if there is no 'endTime' argument`, async () => {
    const query = `query {
      isRecurringTimeAvailable(
        startTime: "${new Date('2021-05-04 14:00')}",
        recurrence: Monthly,
        timePeriod: HalfYear,
        locations: { tableTennis: true }
      ) {
        availableTimes
        unavailableTimes
      }
    }`

    const res = await request.post('/').send({ query }).expect(400)

    expect(res.body.errors[0].extensions.code).toBe('GRAPHQL_VALIDATION_FAILED')
    expect(prisma.$transaction).toBeCalledTimes(0)
  })

  it(`should use the 'HalfYear' value if there is no 'timePeriod' argument specified`, async () => {
    const startTime = new Date('2021-05-04 11:00')
    const query = `query {
      isRecurringTimeAvailable(
        startTime: "${startTime}",
        endTime: "${new Date('2021-05-04 13:00')}",
        recurrence: Weekly,
        locations: { tableTennis: true }
      ) {
        availableTimes
        unavailableTimes
      }
    }`

    const res = await request.post('/').send({ query }).set('Authorization', accessToken).expect(200)

    expect(res.body.data.isRecurringTimeAvailable.availableTimes.length).toBe(27)
    expect(res.body.data.isRecurringTimeAvailable.unavailableTimes.length).toBe(0)
    const dates = [...Array(27).keys()].map((_, index) => {
      const date = new Date(startTime)
      date.setDate(date.getDate() + index * 7)
      return date.toJSON()
    })
    expect(res.body.data.isRecurringTimeAvailable.availableTimes).toIncludeAllMembers(dates)
  })

  it(`should use the 'Weekly' value if there is no 'recurrence' argument specified`, async () => {
    const startTime = new Date('2021-05-04 11:00')
    const query = `query {
      isRecurringTimeAvailable(
        startTime: "${startTime}",
        endTime: "${new Date('2021-05-04 13:00')}",
        timePeriod: HalfYear,
        locations: { tableTennis: true }
      ) {
        availableTimes
        unavailableTimes
      }
    }`

    const res = await request.post('/').send({ query }).set('Authorization', accessToken).expect(200)

    expect(res.body.data.isRecurringTimeAvailable.availableTimes.length).toBe(27)
    expect(res.body.data.isRecurringTimeAvailable.unavailableTimes.length).toBe(0)
    const dates = [...Array(27).keys()].map((_, index) => {
      const date = new Date(startTime)
      date.setDate(date.getDate() + index * 7)
      return date.toJSON()
    })
    expect(res.body.data.isRecurringTimeAvailable.availableTimes).toIncludeAllMembers(dates)
  })

  it(`should throw a GraphQL validation error if there is no 'locations' argument`, async () => {
    const query = `query {
      isRecurringTimeAvailable(
        startTime: "${new Date('2021-05-04 14:00')}",
        endTime: "${new Date('2021-05-04 14:00')}",
        timePeriod: HalfYear,
        recurrence: Monthly
      ) {
        availableTimes
        unavailableTimes
      }
    }`

    const res = await request.post('/').send({ query }).expect(400)

    expect(res.body.errors[0].extensions.code).toBe('GRAPHQL_VALIDATION_FAILED')
    expect(prisma.$transaction).toBeCalledTimes(0)
  })

  it('should throw a PastTimeError if the reservation starts in the past', async () => {
    const query = `query {
      isRecurringTimeAvailable(
        startTime: "${new Date('2021-05-02 14:00')}",
        endTime: "${new Date('2021-05-02 14:00')}",
        timePeriod: HalfYear,
        recurrence: Monthly
      ) {
        availableTimes
        unavailableTimes
      }
    }`

    const res = await request.post('/').send({ query }).expect(200)

    expect(res.body.errors[0].extensions.code).toBe('PAST_TIME')
    expect(prisma.$transaction).toBeCalledTimes(0)
  })
})

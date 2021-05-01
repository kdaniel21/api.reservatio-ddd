import 'reflect-metadata'
import '@modules/reservation'
import { PrismaCustomer, PrismaReservation, PrismaUser } from '.prisma/client'
import UniqueID from '@shared/domain/UniqueID'
import prisma from '@shared/infra/database/prisma/prisma'
import clearAllData from '@shared/infra/database/prisma/utils/clearAllData'
import { InitializedApolloServer, initApolloServer } from '@shared/infra/http/apollo/initApolloServer'
import supertest from 'supertest'
import crypto from 'crypto'
import jwt from 'jsonwebtoken'
import { JwtPayload } from '@modules/users/domain/AccessToken'
import config from '@config'
import { Prisma } from '@prisma/client'

const dayAfterTomorrow = (time: string) => {
  const dayAfterTomorrow = new Date()
  dayAfterTomorrow.setDate(new Date().getDate() + 2)

  return new Date(`${dayAfterTomorrow.toLocaleDateString()} ${time}`)
}

const tomorrow = (time: string) => {
  const tomorrow = new Date()
  tomorrow.setDate(new Date().getDate() + 1)

  return new Date(`${tomorrow.toLocaleDateString()} ${time}`)
}

const yesterday = (time: string) => {
  const yesterday = new Date()
  yesterday.setDate(new Date().getDate() - 1)

  return new Date(`${yesterday.toLocaleDateString()} ${time}`)
}

describe('IsTimeAvailable Integration', () => {
  let initializedServer: InitializedApolloServer
  let request: supertest.SuperTest<supertest.Test>

  let user: PrismaUser
  let customer: PrismaCustomer
  let accessToken: string
  let reservations: Partial<PrismaReservation>[]

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

    reservations = [
      {
        id: new UniqueID().toString(),
        customerId: customer.id,
        name: 'Single Reservation 1',
        startTime: tomorrow('8:00'),
        endTime: tomorrow('10:00'),
        tableTennis: true,
      },
      {
        id: new UniqueID().toString(),
        customerId: customer.id,
        name: 'Single Reservation 2',
        startTime: tomorrow('12:00'),
        endTime: tomorrow('14:00'),
        tableTennis: true,
      },
      {
        id: new UniqueID().toString(),
        customerId: customer.id,
        name: 'Single Reservation For Different Place 1',
        startTime: tomorrow('20:00'),
        endTime: tomorrow('21:00'),
        badminton: true,
      },
      {
        id: new UniqueID().toString(),
        customerId: customer.id,
        name: 'Double Reservation 1',
        startTime: tomorrow('16:00'),
        endTime: tomorrow('17:00'),
        tableTennis: true,
        badminton: true,
      },
    ]
    await prisma.prismaReservation.createMany({
      data: [...(reservations as Prisma.PrismaReservationCreateManyInput[])],
    })
    accessToken = jwt.sign({ userId: user.id, email: user.email } as JwtPayload, config.auth.jwtSecretKey)

    jest.clearAllMocks()
    jest.spyOn(prisma.prismaReservation, 'count')
  })

  it('should return true if there are no other reservations', async () => {
    await clearAllData()
    const startTime = new Date()
    const endTime = new Date()
    endTime.setHours(startTime.getHours() + 2)
    const query = `query {
      isTimeAvailable(
        startTime: "${startTime}",
        endTime: "${endTime}",
        locations: [TableTennis]
      ) {
        isTimeAvailable
      }
    }`

    const res = await request.post('/').send({ query }).set('Authorization', accessToken)

    expect(res.body.data.isTimeAvailable.isTimeAvailable).toBe(true)
  })

  it('should return true if there are no other reservations for a particular day', async () => {
    await clearAllData()
    const query = `query {
      isTimeAvailable(
        startTime: "${dayAfterTomorrow('10:00')}",
        endTime: "${dayAfterTomorrow('13:30')}",
        locations: [TableTennis]
      ) {
        isTimeAvailable
      }
    }`

    const res = await request.post('/').send({ query }).set('Authorization', accessToken).expect(200)

    expect(res.body.data.isTimeAvailable.isTimeAvailable).toBe(true)
  })

  it('should return true if the reservation starts right after the previous ends', async () => {
    const query = `query {
      isTimeAvailable(
        startTime: "${tomorrow('10:00')}",
        endTime: "${tomorrow('11:00')}",
        locations: [TableTennis]
      ) {
        isTimeAvailable
      }
    }`

    const res = await request.post('/').send({ query }).set('Authorization', accessToken).expect(200)

    expect(res.body.data.isTimeAvailable.isTimeAvailable).toBe(true)
  })

  it('should return true if the reservation ends right before the next starts', async () => {
    const query = `query {
      isTimeAvailable(
        startTime: "${tomorrow('6:00')}",
        endTime: "${tomorrow('8:00')}",
        locations: [TableTennis]
      ) {
        isTimeAvailable
      }
    }`

    const res = await request.post('/').send({ query }).set('Authorization', accessToken).expect(200)

    expect(res.body.data.isTimeAvailable.isTimeAvailable).toBe(true)
  })

  it('should return false if an existing reservation starts and ends within the reservation time', async () => {
    const query = `query {
      isTimeAvailable(
        startTime: "${tomorrow('7:45')}",
        endTime: "${tomorrow('10:15')}",
        locations: [TableTennis]
      ) {
        isTimeAvailable
      }
    }`

    const res = await request.post('/').send({ query }).set('Authorization', accessToken).expect(200)

    expect(res.body.data.isTimeAvailable.isTimeAvailable).toBe(false)
  })

  it('should return true if an existing reservation for a different place starts and ends within the reservation time', async () => {
    const query = `query {
      isTimeAvailable(
        startTime: "${tomorrow('19:45')}",
        endTime: "${tomorrow('21:15')}",
        locations: [TableTennis]
      ) {
        isTimeAvailable
      }
    }`

    const res = await request.post('/').send({ query }).set('Authorization', accessToken).expect(200)

    expect(res.body.data.isTimeAvailable.isTimeAvailable).toBe(true)
  })

  it('should return false if an existing single-place reservation starts and ends within the reservation time for both locations', async () => {
    const query = `query {
      isTimeAvailable(
        startTime: "${tomorrow('19:45')}",
        endTime: "${tomorrow('21:15')}",
        locations: [TableTennis, Badminton]
      ) {
        isTimeAvailable
      }
    }`

    const res = await request.post('/').send({ query }).set('Authorization', accessToken).expect(200)

    expect(res.body.data.isTimeAvailable.isTimeAvailable).toBe(false)
  })

  it('should return false if an existing reservation ends within the reservation time', async () => {
    const query = `query {
      isTimeAvailable(
        startTime: "${tomorrow('9:30')}",
        endTime: "${tomorrow('10:30')}",
        locations: [TableTennis]
      ) {
        isTimeAvailable
      }
    }`

    const res = await request.post('/').send({ query }).set('Authorization', accessToken).expect(200)

    expect(res.body.data.isTimeAvailable.isTimeAvailable).toBe(false)
  })

  it('should return false if an existing single-place reservation ends within the reservation time for both locations', async () => {
    const query = `query {
      isTimeAvailable(
        startTime: "${tomorrow('9:30')}",
        endTime: "${tomorrow('10:30')}",
        locations: [TableTennis, Badminton]
      ) {
        isTimeAvailable
      }
    }`

    const res = await request.post('/').send({ query }).set('Authorization', accessToken).expect(200)

    expect(res.body.data.isTimeAvailable.isTimeAvailable).toBe(false)
  })

  it('should return true if an existing reservation for a different place ends within the reservation time', async () => {
    const query = `query {
      isTimeAvailable(
        startTime: "${tomorrow('20:30')}",
        endTime: "${tomorrow('21:30')}",
        locations: [TableTennis]
      ) {
        isTimeAvailable
      }
    }`

    const res = await request.post('/').send({ query }).set('Authorization', accessToken).expect(200)

    expect(res.body.data.isTimeAvailable.isTimeAvailable).toBe(true)
  })

  it('should return false if an existing reservation starts within the reservation time', async () => {
    const query = `query {
      isTimeAvailable(
        startTime: "${tomorrow('7:30')}",
        endTime: "${tomorrow('8:30')}",
        locations: [TableTennis]
      ) {
        isTimeAvailable
      }
    }`

    const res = await request.post('/').send({ query }).set('Authorization', accessToken).expect(200)

    expect(res.body.data.isTimeAvailable.isTimeAvailable).toBe(false)
  })

  it('should return false if an existing single-place reservation starts within the reservation time for both locations', async () => {
    const query = `query {
      isTimeAvailable(
        startTime: "${tomorrow('7:30')}",
        endTime: "${tomorrow('8:30')}",
        locations: [TableTennis, Badminton]
      ) {
        isTimeAvailable
      }
    }`

    const res = await request.post('/').send({ query }).set('Authorization', accessToken).expect(200)

    expect(res.body.data.isTimeAvailable.isTimeAvailable).toBe(false)
  })

  it('should return true if an existing reservation for a different place starts within the reservation time', async () => {
    const query = `query {
      isTimeAvailable(
        startTime: "${tomorrow('19:30')}",
        endTime: "${tomorrow('20:30')}",
        locations: [TableTennis]
      ) {
        isTimeAvailable
      }
    }`

    const res = await request.post('/').send({ query }).set('Authorization', accessToken).expect(200)

    expect(res.body.data.isTimeAvailable.isTimeAvailable).toBe(true)
  })

  it('should return false if the reservation starts and ends within an existing reservation', async () => {
    const query = `query {
      isTimeAvailable(
        startTime: "${tomorrow('8:30')}",
        endTime: "${tomorrow('9:30')}",
        locations: [TableTennis]
      ) {
        isTimeAvailable
      }
    }`

    const res = await request.post('/').send({ query }).set('Authorization', accessToken).expect(200)

    expect(res.body.data.isTimeAvailable.isTimeAvailable).toBe(false)
  })

  it('should return false if the reservation for both locations starts and ends within an existing reservation for a single place', async () => {
    const query = `query {
      isTimeAvailable(
        startTime: "${tomorrow('8:30')}",
        endTime: "${tomorrow('9:30')}",
        locations: [TableTennis, Badminton]
      ) {
        isTimeAvailable
      }
    }`

    const res = await request.post('/').send({ query }).set('Authorization', accessToken).expect(200)

    expect(res.body.data.isTimeAvailable.isTimeAvailable).toBe(false)
  })

  it('should return true if the reservation starts and ends within an existing reservation for a different place', async () => {
    const query = `query {
      isTimeAvailable(
        startTime: "${tomorrow('20:15')}",
        endTime: "${tomorrow('20:45')}",
        locations: [TableTennis]
      ) {
        isTimeAvailable
      }
    }`

    const res = await request.post('/').send({ query }).set('Authorization', accessToken).expect(200)

    expect(res.body.data.isTimeAvailable.isTimeAvailable).toBe(true)
  })

  it('should throw a InvalidReservationError if the requested time span is greater than the allowed maximum', async () => {
    const query = `query {
      isTimeAvailable(
        startTime: "${tomorrow('10:00')}",
        endTime: "${tomorrow('15:00')}",
        locations: [TableTennis]
      ) {
        isTimeAvailable
      }
    }`

    const res = await request.post('/').send({ query }).set('Authorization', accessToken).expect(200)

    expect(res.body.errors[0].extensions.code).toBe('INVALID_TIME_SPAN')
    expect(prisma.prismaReservation.count).not.toBeCalled()
  })

  it('should not throw a InvalidReservationError if the requested time span is the same as the allowed maximum', async () => {
    const query = `query {
      isTimeAvailable(
        startTime: "${tomorrow('10:00')}",
        endTime: "${tomorrow('14:00')}",
        locations: [TableTennis]
      ) {
        isTimeAvailable
      }
    }`

    const res = await request.post('/').send({ query }).set('Authorization', accessToken).expect(200)

    expect(res.body.data.isTimeAvailable).toBeTruthy()
    expect(res.body.errors).toBeFalsy()
    expect(prisma.prismaReservation.count).toBeCalled()
  })

  it('should not throw a InvalidReservationError if the requested time span is less than the allowed maximum', async () => {
    const query = `query {
      isTimeAvailable(
        startTime: "${tomorrow('10:00')}",
        endTime: "${tomorrow('14:00')}",
        locations: [TableTennis]
      ) {
        isTimeAvailable
      }
    }`

    const res = await request.post('/').send({ query }).set('Authorization', accessToken).expect(200)

    expect(res.body.data.isTimeAvailable).toBeTruthy()
    expect(res.body.errors).toBeFalsy()
    expect(prisma.prismaReservation.count).toBeCalled()
  })

  it(`should throw a GraphQL validation error if 'startTime' is not specified`, async () => {
    const query = `query {
      isTimeAvailable(
        endTime: "${tomorrow('14:00')}",
        locations: [TableTennis]
      ) {
        isTimeAvailable
      }
    }`

    const res = await request.post('/').send({ query }).set('Authorization', accessToken).expect(400)

    expect(res.body.errors[0].extensions.code).toBe('GRAPHQL_VALIDATION_FAILED')
    expect(prisma.prismaReservation.count).not.toBeCalled()
  })

  it(`should throw a GraphQL validation error if 'endTime' is not specified`, async () => {
    const query = `query {
      isTimeAvailable(
        startTime: "${tomorrow('10:00')}",
        locations: [TableTennis]
      ) {
        isTimeAvailable
      }
    }`

    const res = await request.post('/').send({ query }).set('Authorization', accessToken).expect(400)

    expect(res.body.errors[0].extensions.code).toBe('GRAPHQL_VALIDATION_FAILED')
    expect(prisma.prismaReservation.count).not.toBeCalled()
  })

  it(`should throw a GraphQL validation error if 'locations' is not specified`, async () => {
    const query = `query {
      isTimeAvailable(
        startTime: "${tomorrow('10:00')}",
        endTime: "${tomorrow('14:00')}",
      ) {
        isTimeAvailable
      }
    }`

    const res = await request.post('/').send({ query }).set('Authorization', accessToken).expect(400)

    expect(res.body.errors[0].extensions.code).toBe('GRAPHQL_VALIDATION_FAILED')
    expect(prisma.prismaReservation.count).not.toBeCalled()
  })

  it('should throw an InvalidOrMissingAccessTokenError if no access token is provided', async () => {
    const query = `query {
      isTimeAvailable(
        startTime: "${tomorrow('10:00')}",
        endTime: "${tomorrow('14:00')}",
        locations: [TableTennis]
      ) {
        isTimeAvailable
      }
    }`

    const res = await request.post('/').send({ query }).expect(200)

    expect(res.body.errors[0].extensions.code).toBe('INVALID_ACCESS_TOKEN')
    expect(prisma.prismaReservation.count).not.toBeCalled()
  })

  it('should throw an InvalidAccessTokenError if the provided access token is invalid', async () => {
    const invalidAccessToken = jwt.sign({ userId: user.id, email: user.email } as JwtPayload, 'DefinitelyInvalidSecret')
    const query = `query {
      isTimeAvailable(
        startTime: "${tomorrow('10:00')}",
        endTime: "${tomorrow('14:00')}",
        locations: [TableTennis]
      ) {
        isTimeAvailable
      }
    }`

    const res = await request.post('/').send({ query }).set('Authorization', invalidAccessToken).expect(200)

    expect(res.body.errors[0].extensions.code).toBe('INVALID_ACCESS_TOKEN')
    expect(prisma.prismaReservation.count).not.toBeCalled()
  })

  it('should throw a PastTimeError if the requested time is in the past', async () => {
    const query = `query {
      isTimeAvailable(
        startTime: "${yesterday('10:00')}",
        endTime: "${yesterday('14:00')}",
        locations: [TableTennis]
      ) {
        isTimeAvailable
      }
    }`

    const res = await request.post('/').send({ query }).set('Authorization', accessToken).expect(200)

    expect(res.body.errors[0].extensions.code).toBe('PAST_TIME')
    expect(prisma.prismaReservation.count).not.toBeCalled()
  })

  it('should throw a PastTimeError if the requested time is today but in the past', async () => {
    const startTime = new Date()
    startTime.setHours(new Date().getHours() - 2)
    const endTime = new Date()
    endTime.setHours(new Date().getHours() - 1)
    const query = `query {
      isTimeAvailable(
        startTime: "${startTime}",
        endTime: "${endTime}",
        locations: [TableTennis]
      ) {
        isTimeAvailable
      }
    }`

    const res = await request.post('/').send({ query }).set('Authorization', accessToken).expect(200)

    expect(res.body.errors[0].extensions.code).toBe('PAST_TIME')
    expect(prisma.prismaReservation.count).not.toBeCalled()
  })
})

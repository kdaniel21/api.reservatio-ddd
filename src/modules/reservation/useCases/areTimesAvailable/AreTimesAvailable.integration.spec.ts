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
import { advanceTo } from 'jest-date-mock'

describe('AreTimesAvailable Integration', () => {
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

    advanceTo('2021-05-03 10:00')

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
        startTime: new Date('2021-05-04 8:00'),
        endTime: new Date('2021-05-04 10:00'),
        tableTennis: true,
      },
      {
        id: new UniqueID().toString(),
        customerId: customer.id,
        name: 'Single Reservation 2',
        startTime: new Date('2021-05-04 12:00'),
        endTime: new Date('2021-05-04 14:00'),
        tableTennis: true,
      },
      {
        id: new UniqueID().toString(),
        customerId: customer.id,
        name: 'Single Reservation For Different Place 1',
        startTime: new Date('2021-05-04 20:00'),
        endTime: new Date('2021-05-04 21:00'),
        badminton: true,
      },
      {
        id: new UniqueID().toString(),
        customerId: customer.id,
        name: 'Double Reservation 1',
        startTime: new Date('2021-05-04 16:00'),
        endTime: new Date('2021-05-04 17:00'),
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
    const query = `query {
      areTimesAvailable(
        timeProposals: [
          {
            startTime: "${new Date('2021-05-03 10:00')}",
            endTime: "${new Date('2021-05-03 12:00')}",
            locations: { tableTennis: true }
          },
          {
            startTime: "${new Date('2021-05-03 14:00')}",
            endTime: "${new Date('2021-05-03 15:00')}",
            locations: { badminton: true }
          }
        ]
      ) {
        startTime
        endTime
        locations {
          tableTennis
          badminton
        }
        isTimeAvailable
      }
    }`

    const res = await request.post('/').send({ query }).set('Authorization', accessToken).expect(200)

    expect(res.body.data.areTimesAvailable[0].isTimeAvailable).toBe(true)
    expect(res.body.data.areTimesAvailable[0].startTime).toBe(new Date('2021-05-03 10:00').toJSON())
    expect(res.body.data.areTimesAvailable[0].endTime).toBe(new Date('2021-05-03 12:00').toJSON())
    expect(res.body.data.areTimesAvailable[0].locations.badminton).toBe(false)
    expect(res.body.data.areTimesAvailable[0].locations.tableTennis).toBe(true)
    expect(res.body.data.areTimesAvailable[1].isTimeAvailable).toBe(true)
    expect(res.body.data.areTimesAvailable[1].startTime).toBe(new Date('2021-05-03 14:00').toJSON())
    expect(res.body.data.areTimesAvailable[1].endTime).toBe(new Date('2021-05-03 15:00').toJSON())
    expect(res.body.data.areTimesAvailable[1].locations.badminton).toBe(true)
    expect(res.body.data.areTimesAvailable[1].locations.tableTennis).toBe(false)
  })

  it('should exclude a reservation with a specific ID', async () => {
    const query = `query {
      areTimesAvailable(
        timeProposals: [
          {
            startTime: "${new Date('2021-05-04 8:30')}",
            endTime: "${new Date('2021-05-04 9:30')}",
            locations: { tableTennis: true },
            excludedReservation: "${reservations[0].id}"
          }
        ],
      ) {
        startTime
        endTime
        locations {
          tableTennis
          badminton
        }
        isTimeAvailable
      }
    }`

    const res = await request.post('/').send({ query }).set('Authorization', accessToken).expect(200)

    expect(res.body.data.areTimesAvailable[0].isTimeAvailable).toBe(true)
    expect(res.body.data.areTimesAvailable[0].startTime).toBe(new Date('2021-05-04 8:30').toJSON())
    expect(res.body.data.areTimesAvailable[0].endTime).toBe(new Date('2021-05-04 9:30').toJSON())
    expect(res.body.data.areTimesAvailable[0].locations.badminton).toBe(false)
    expect(res.body.data.areTimesAvailable[0].locations.tableTennis).toBe(true)
  })

  it('should return both true and false if one of the times is not available', async () => {
    const query = `query {
      areTimesAvailable(
        timeProposals: [
          {
            startTime: "${new Date('2021-05-04 8:30')}",
            endTime: "${new Date('2021-05-04 9:30')}",
            locations: { tableTennis: true }
          },
          {
            startTime: "${new Date('2021-05-03 14:00')}",
            endTime: "${new Date('2021-05-03 15:00')}",
            locations: { badminton: true }
          }
        ]
      ) {
        startTime
        endTime
        locations {
          tableTennis
          badminton
        }
        isTimeAvailable
      }
    }`

    const res = await request.post('/').send({ query }).set('Authorization', accessToken).expect(200)

    expect(res.body.data.areTimesAvailable[0].isTimeAvailable).toBe(false)
    expect(res.body.data.areTimesAvailable[0].startTime).toBe(new Date('2021-05-04 8:30').toJSON())
    expect(res.body.data.areTimesAvailable[0].endTime).toBe(new Date('2021-05-04 9:30').toJSON())
    expect(res.body.data.areTimesAvailable[0].locations.badminton).toBe(false)
    expect(res.body.data.areTimesAvailable[0].locations.tableTennis).toBe(true)
    expect(res.body.data.areTimesAvailable[1].isTimeAvailable).toBe(true)
    expect(res.body.data.areTimesAvailable[1].startTime).toBe(new Date('2021-05-03 14:00').toJSON())
    expect(res.body.data.areTimesAvailable[1].endTime).toBe(new Date('2021-05-03 15:00').toJSON())
    expect(res.body.data.areTimesAvailable[1].locations.badminton).toBe(true)
    expect(res.body.data.areTimesAvailable[1].locations.tableTennis).toBe(false)
  })

  it('should return true if there are no other reservations for a particular day', async () => {
    await clearAllData()
    const query = `query {
      areTimesAvailable(
        timeProposals: [
          {
            startTime: "${new Date('2021-05-05 10:00')}",
            endTime: "${new Date('2021-05-05 13:30')}",
            locations: { tableTennis: true }
          }
        ]
      ) {
        startTime
        endTime
        locations {
          tableTennis
          badminton
        }
        isTimeAvailable
      }
    }`

    const res = await request.post('/').send({ query }).set('Authorization', accessToken).expect(200)

    expect(res.body.data.areTimesAvailable[0].isTimeAvailable).toBe(true)
  })

  it('should return true if the reservation starts right after the previous ends', async () => {
    const query = `query {
      areTimesAvailable(
        timeProposals: [
          {
            startTime: "${new Date('2021-05-04 10:00')}",
            endTime: "${new Date('2021-05-04 11:00')}",
            locations: { tableTennis: true }
          }
        ]
      ) {
        startTime
        endTime
        locations {
          tableTennis
          badminton
        }
        isTimeAvailable
      }
    }`

    const res = await request.post('/').send({ query }).set('Authorization', accessToken).expect(200)

    expect(res.body.data.areTimesAvailable[0].isTimeAvailable).toBe(true)
  })

  it('should return true if the reservation ends right before the next starts', async () => {
    const query = `query {
      areTimesAvailable(
        timeProposals: [
          {
            startTime: "${new Date('2021-05-04 6:00')}",
            endTime: "${new Date('2021-05-04 8:00')}",
            locations: { tableTennis: true }
          }
        ]
      ) {
        startTime
        endTime
        locations {
          tableTennis
          badminton
        }
        isTimeAvailable
      }
    }`

    const res = await request.post('/').send({ query }).set('Authorization', accessToken).expect(200)

    expect(res.body.data.areTimesAvailable[0].isTimeAvailable).toBe(true)
  })

  it('should return false if an existing reservation starts and ends within the reservation time', async () => {
    const query = `query {
      areTimesAvailable(
        timeProposals: [
          {
            startTime: "${new Date('2021-05-04 7:45')}",
            endTime: "${new Date('2021-05-04 10:15')}",
            locations: { tableTennis: true }
          }
        ]
      ) {
        startTime
        endTime
        locations {
          tableTennis
          badminton
        }
        isTimeAvailable
      }
    }`

    const res = await request.post('/').send({ query }).set('Authorization', accessToken).expect(200)

    expect(res.body.data.areTimesAvailable[0].isTimeAvailable).toBe(false)
  })

  it('should return true if an existing reservation for a different place starts and ends within the reservation time', async () => {
    const query = `query {
      areTimesAvailable(
        timeProposals: [
          {
            startTime: "${new Date('2021-05-04 19:45')}",
            endTime: "${new Date('2021-05-04 21:15')}",
            locations: { tableTennis: true }
          }
        ]
      ) {
        startTime
        endTime
        locations {
          tableTennis
          badminton
        }
        isTimeAvailable
      }
    }`

    const res = await request.post('/').send({ query }).set('Authorization', accessToken).expect(200)

    expect(res.body.data.areTimesAvailable[0].isTimeAvailable).toBe(true)
  })

  it('should return false if an existing single-place reservation starts and ends within the reservation time for both locations', async () => {
    const query = `query {
      areTimesAvailable(
        timeProposals: [
          {
            startTime: "${new Date('2021-05-04 19:45')}",
            endTime: "${new Date('2021-05-04 21:15')}",
            locations: { tableTennis: true, badminton: true }
          }
        ]
      ) {
        startTime
        endTime
        locations {
          tableTennis
          badminton
        }
        isTimeAvailable
      }
    }`

    const res = await request.post('/').send({ query }).set('Authorization', accessToken).expect(200)

    expect(res.body.data.areTimesAvailable[0].isTimeAvailable).toBe(false)
  })

  it('should return false if an existing reservation ends within the reservation time', async () => {
    const query = `query {
      areTimesAvailable(
        timeProposals: [
          {
            startTime: "${new Date('2021-05-04 9:30')}",
            endTime: "${new Date('2021-05-04 10:30')}",
            locations: { tableTennis: true }
          }
        ]
      ) {
        startTime
        endTime
        locations {
          tableTennis
          badminton
        }
        isTimeAvailable
      }
    }`

    const res = await request.post('/').send({ query }).set('Authorization', accessToken).expect(200)

    expect(res.body.data.areTimesAvailable[0].isTimeAvailable).toBe(false)
  })

  it('should return false if an existing single-place reservation ends within the reservation time for both locations', async () => {
    const query = `query {
      areTimesAvailable(
        timeProposals: [
          {
            startTime: "${new Date('2021-05-04 9:30')}",
            endTime: "${new Date('2021-05-04 10:30')}",
            locations: { tableTennis: true }
          }
        ]
      ) {
        startTime
        endTime
        locations {
          tableTennis
          badminton
        }
        isTimeAvailable
      }
    }`

    const res = await request.post('/').send({ query }).set('Authorization', accessToken).expect(200)

    expect(res.body.data.areTimesAvailable[0].isTimeAvailable).toBe(false)
  })

  it('should return true if an existing reservation for a different place ends within the reservation time', async () => {
    const query = `query {
      areTimesAvailable(
        timeProposals: [
          {
            startTime: "${new Date('2021-05-04 20:30')}",
            endTime: "${new Date('2021-05-04 21:30')}",
            locations: { tableTennis: true }
          }
        ]
      ) {
        startTime
        endTime
        locations {
          tableTennis
          badminton
        }
        isTimeAvailable
      }
    }`

    const res = await request.post('/').send({ query }).set('Authorization', accessToken).expect(200)

    expect(res.body.data.areTimesAvailable[0].isTimeAvailable).toBe(true)
  })

  it('should return false if an existing reservation starts within the reservation time', async () => {
    const query = `query {
      areTimesAvailable(
        timeProposals: [
          {
            startTime: "${new Date('2021-05-04 7:30')}",
            endTime: "${new Date('2021-05-04 8:30')}",
            locations: { tableTennis: true }
          }
        ]
      ) {
        startTime
        endTime
        locations {
          tableTennis
          badminton
        }
        isTimeAvailable
      }
    }`

    const res = await request.post('/').send({ query }).set('Authorization', accessToken).expect(200)

    expect(res.body.data.areTimesAvailable[0].isTimeAvailable).toBe(false)
  })

  it('should return false if an existing single-place reservation starts within the reservation time for both locations', async () => {
    const query = `query {
      areTimesAvailable(
        timeProposals: [
          {
            startTime: "${new Date('2021-05-04 7:30')}",
            endTime: "${new Date('2021-05-04 8:30')}",
            locations: { tableTennis: true, badminton: true }
          }
        ]
      ) {
        startTime
        endTime
        locations {
          tableTennis
          badminton
        }
        isTimeAvailable
      }
    }`

    const res = await request.post('/').send({ query }).set('Authorization', accessToken).expect(200)

    expect(res.body.data.areTimesAvailable[0].isTimeAvailable).toBe(false)
  })

  it('should return true if an existing reservation for a different place starts within the reservation time', async () => {
    const query = `query {
      areTimesAvailable(
        timeProposals: [
          {
            startTime: "${new Date('2021-05-04 19:30')}",
            endTime: "${new Date('2021-05-04 20:30')}",
            locations: { tableTennis: true }
          }
        ]
      ) {
        startTime
        endTime
        locations {
          tableTennis
          badminton
        }
        isTimeAvailable
      }
    }`

    const res = await request.post('/').send({ query }).set('Authorization', accessToken).expect(200)

    expect(res.body.data.areTimesAvailable[0].isTimeAvailable).toBe(true)
  })

  it('should return false if the reservation starts and ends within an existing reservation', async () => {
    const query = `query {
      areTimesAvailable(
        timeProposals: [
          {
            startTime: "${new Date('2021-05-04 8:30')}",
            endTime: "${new Date('2021-05-04 9:30')}",
            locations: { tableTennis: true }
          }
        ]
      ) {
        startTime
        endTime
        locations {
          tableTennis
          badminton
        }
        isTimeAvailable
      }
    }`

    const res = await request.post('/').send({ query }).set('Authorization', accessToken).expect(200)

    expect(res.body.data.areTimesAvailable[0].isTimeAvailable).toBe(false)
  })

  it('should return false if the reservation for both locations starts and ends within an existing reservation for a single place', async () => {
    const query = `query {
      areTimesAvailable(
        timeProposals: [
          {
            startTime: "${new Date('2021-05-04 8:30')}",
            endTime: "${new Date('2021-05-04 9:30')}",
            locations: { tableTennis: true, badminton: true }
          }
        ]
      ) {
        startTime
        endTime
        locations {
          tableTennis
          badminton
        }
        isTimeAvailable
      }
    }`

    const res = await request.post('/').send({ query }).set('Authorization', accessToken).expect(200)

    expect(res.body.data.areTimesAvailable[0].isTimeAvailable).toBe(false)
  })

  it('should return true if the reservation starts and ends within an existing reservation for a different place', async () => {
    const query = `query {
      areTimesAvailable(
        timeProposals: [
          {
            startTime: "${new Date('2021-05-04 20:15')}",
            endTime: "${new Date('2021-05-04 20:45')}",
            locations: { tableTennis: true }
          }
        ]
      ) {
        startTime
        endTime
        locations {
          tableTennis
          badminton
        }
        isTimeAvailable
      }
    }`

    const res = await request.post('/').send({ query }).set('Authorization', accessToken).expect(200)

    expect(res.body.data.areTimesAvailable[0].isTimeAvailable).toBe(true)
  })

  it('should return false if the reservation starts and ends exactly at the same time as an existing reservation', async () => {
    const query = `query {
      areTimesAvailable(
        timeProposals: [
          {
            startTime: "${new Date('2021-05-04 12:00')}",
            endTime: "${new Date('2021-05-04 14:00')}",
            locations: { tableTennis: true }
          }
        ]
      ) {
        startTime
        endTime
        locations {
          tableTennis
          badminton
        }
        isTimeAvailable
      }
    }`

    const res = await request.post('/').send({ query }).set('Authorization', accessToken).expect(200)

    expect(res.body.data.areTimesAvailable[0].isTimeAvailable).toBe(false)
  })

  it('should throw a InvalidReservationError if the requested time span is greater than the allowed maximum', async () => {
    const query = `query {
      areTimesAvailable(
        timeProposals: [
          {
            startTime: "${new Date('2021-05-04 10:00')}",
            endTime: "${new Date('2021-05-04 15:00')}",
            locations: { tableTennis: true }
          }
        ]
      ) {
        startTime
        endTime
        locations {
          tableTennis
          badminton
        }
        isTimeAvailable
      }
    }`

    const res = await request.post('/').send({ query }).set('Authorization', accessToken).expect(200)

    expect(res.body.errors[0].extensions.code).toBe('INVALID_TIME_SPAN')
    expect(prisma.prismaReservation.count).not.toBeCalled()
  })

  it('should not throw a InvalidReservationError if the requested time span is the same as the allowed maximum', async () => {
    const query = `query {
      areTimesAvailable(
        timeProposals: [
          {
            startTime: "${new Date('2021-05-04 10:00')}",
            endTime: "${new Date('2021-05-04 14:00')}",
            locations: { tableTennis: true }
          }
        ]
      ) {
        startTime
        endTime
        locations {
          tableTennis
          badminton
        }
        isTimeAvailable
      }
    }`

    const res = await request.post('/').send({ query }).set('Authorization', accessToken).expect(200)

    expect(res.body.data.areTimesAvailable).toBeTruthy()
    expect(res.body.errors).toBeFalsy()
    expect(prisma.prismaReservation.count).toBeCalled()
  })

  it('should not throw a InvalidReservationError if the requested time span is less than the allowed maximum', async () => {
    const query = `query {
      areTimesAvailable(
        timeProposals: [
          {
            startTime: "${new Date('2021-05-04 10:00')}",
            endTime: "${new Date('2021-05-04 14:00')}",
            locations: { tableTennis: true }
          }
        ]
      ) {
        startTime
        endTime
        locations {
          tableTennis
          badminton
        }
        isTimeAvailable
      }
    }`

    const res = await request.post('/').send({ query }).set('Authorization', accessToken).expect(200)

    expect(res.body.data.areTimesAvailable).toBeTruthy()
    expect(res.body.errors).toBeFalsy()
    expect(prisma.prismaReservation.count).toBeCalled()
  })

  it('should throw a InvalidReservationLocationError if both locations are false', async () => {
    const query = `query {
      areTimesAvailable(
        timeProposals: [
          {
            startTime: "${new Date('2021-05-04 10:00')}",
            endTime: "${new Date('2021-05-04 14:00')}",
            locations: { tableTennis: false, badminton: false }
          }
        ]
      ) {
        startTime
        endTime
        locations {
          tableTennis
          badminton
        }
        isTimeAvailable
      }
    }`

    const res = await request.post('/').send({ query }).set('Authorization', accessToken).expect(200)

    expect(res.body.errors[0].extensions.code).toBe('VALIDATION_ERROR')
    expect(prisma.prismaReservation.count).not.toBeCalled()
  })

  it(`should throw a InvalidReservationLocationError if 'locations' is an empty object`, async () => {
    const query = `query {
      areTimesAvailable(
        timeProposals: [
          {
            startTime: "${new Date('2021-05-04 10:00')}",
            endTime: "${new Date('2021-05-04 14:00')}",
            locations: {}
          }
        ]
      ) {
        startTime
        endTime
        locations {
          tableTennis
          badminton
        }
        isTimeAvailable
      }
    }`

    const res = await request.post('/').send({ query }).set('Authorization', accessToken).expect(200)

    expect(res.body.errors[0].extensions.code).toBe('VALIDATION_ERROR')
    expect(prisma.prismaReservation.count).not.toBeCalled()
  })

  it(`should throw a GraphQL validation error if 'startTime' is not specified`, async () => {
    const query = `query {
      areTimesAvailable(
        timeProposals: [
          {
            endTime: "${new Date('2021-05-04 14:00')}",
            locations: { tableTennis: true }
          }
        ]
      ) {
        startTime
        endTime
        locations {
          tableTennis
          badminton
        }
        isTimeAvailable
      }
    }`

    const res = await request.post('/').send({ query }).set('Authorization', accessToken).expect(400)

    expect(res.body.errors[0].extensions.code).toBe('GRAPHQL_VALIDATION_FAILED')
    expect(prisma.prismaReservation.count).not.toBeCalled()
  })

  it(`should throw a GraphQL validation error if 'endTime' is not specified`, async () => {
    const query = `query {
      areTimesAvailable(
        timeProposals: [
          {
            startTime: "${new Date('2021-05-04 10:00')}",
            locations: { tableTennis: true }
          }
        ]
      ) {
        startTime
        endTime
        locations {
          tableTennis
          badminton
        }
        isTimeAvailable
      }
    }`

    const res = await request.post('/').send({ query }).set('Authorization', accessToken).expect(400)

    expect(res.body.errors[0].extensions.code).toBe('GRAPHQL_VALIDATION_FAILED')
    expect(prisma.prismaReservation.count).not.toBeCalled()
  })

  it(`should throw a GraphQL validation error if 'locations' is not specified`, async () => {
    const query = `query {
      areTimesAvailable(
        timeProposals: [
          {
            startTime: "${new Date('2021-05-04 10:00')}",
            endTime: "${new Date('2021-05-04 14:00')}",
          }
        ]
      ) {
        startTime
        endTime
        locations {
          tableTennis
          badminton
        }
        isTimeAvailable
      }
    }`

    const res = await request.post('/').send({ query }).set('Authorization', accessToken).expect(400)

    expect(res.body.errors[0].extensions.code).toBe('GRAPHQL_VALIDATION_FAILED')
    expect(prisma.prismaReservation.count).not.toBeCalled()
  })

  it('should throw an InvalidOrMissingAccessTokenError if no access token is provided', async () => {
    const query = `query {
      areTimesAvailable(
        timeProposals: [
          {
            startTime: "${new Date('2021-05-04 10:00')}",
            endTime: "${new Date('2021-05-04 14:00')}",
            locations: { tableTennis: true }
          }
        ]
      ) {
        startTime
        endTime
        locations {
          tableTennis
          badminton
        }
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
      areTimesAvailable(
        timeProposals: [
          {
            startTime: "${new Date('2021-05-04 10:00')}",
            endTime: "${new Date('2021-05-04 14:00')}",
            locations: { tableTennis: true }
          }
        ]
      ) {
        startTime
        endTime
        locations {
          tableTennis
          badminton
        }
        isTimeAvailable
      }
    }`

    const res = await request.post('/').send({ query }).set('Authorization', invalidAccessToken).expect(200)

    expect(res.body.errors[0].extensions.code).toBe('INVALID_ACCESS_TOKEN')
    expect(prisma.prismaReservation.count).not.toBeCalled()
  })

  it('should throw a PastTimeError if the requested time is in the past', async () => {
    const query = `query {
      areTimesAvailable(
        timeProposals: [
          {
            startTime: "${new Date('2021-05-02 10:00')}",
            endTime: "${new Date('2021-05-02 14:00')}",
            locations: { tableTennis: true }
          }
        ]
      ) {
        startTime
        endTime
        locations {
          tableTennis
          badminton
        }
        isTimeAvailable
      }
    }`

    const res = await request.post('/').send({ query }).set('Authorization', accessToken).expect(200)

    expect(res.body.errors[0].extensions.code).toBe('PAST_TIME')
    expect(prisma.prismaReservation.count).not.toBeCalled()
  })

  it('should throw a PastTimeError if the requested time is today but in the past', async () => {
    const startTime = new Date('2021-05-03 8:00')
    const endTime = new Date('2021-05-03 9:00')
    const query = `query {
      areTimesAvailable(
        timeProposals: [
          {
            startTime: "${startTime}",
            endTime: "${endTime}",
            locations: { tableTennis: true }
          }
        ]
      ) {
        startTime
        endTime
        locations {
          tableTennis
          badminton
        }
        isTimeAvailable
      }
    }`

    const res = await request.post('/').send({ query }).set('Authorization', accessToken).expect(200)

    expect(res.body.errors[0].extensions.code).toBe('PAST_TIME')
    expect(prisma.prismaReservation.count).not.toBeCalled()
  })
})

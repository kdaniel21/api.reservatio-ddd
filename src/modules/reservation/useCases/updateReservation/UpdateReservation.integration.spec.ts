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
import ReservationTime from '@modules/reservation/domain/ReservationTime'
import AreTimesAvailableUseCase from '../areTimesAvailable/AreTimesAvailableUseCase'
import CustomerRole from '@modules/reservation/domain/CustomerRole'
import { add, addHours } from 'date-fns'

describe('UpdateReservation Integration', () => {
  let initializedServer: InitializedApolloServer
  let request: supertest.SuperTest<supertest.Test>

  let user: PrismaUser
  let customer: PrismaCustomer
  let accessToken: string
  let adminAccessToken: string
  let reservationToUpdate: Partial<PrismaReservation>
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
    adminAccessToken = jwt.sign(
      { userId: adminUser.id, email: adminUser.email } as JwtPayload,
      config.auth.jwtSecretKey
    )

    reservations = [
      {
        id: new UniqueID().toString(),
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

    reservationToUpdate = { ...reservations[1] }

    jest.spyOn(prisma, '$transaction')
    jest.spyOn(prisma.prismaReservation, 'update')
    jest.spyOn(prisma.prismaReservation, 'updateMany')
    jest.spyOn(AreTimesAvailableUseCase.prototype, 'execute')
    jest.clearAllMocks()
  })

  it('should update the name of a single reservation', async () => {
    const query = `mutation {
      updateReservation(
        id: "${reservationToUpdate.id}",
        updatedProperties: {
          name: "updated name"
        }
      ) {
        id
        recurringId
        name
      }
    }`

    const res = await request.post('/').send({ query }).set('Authorization', accessToken).expect(200)

    expect(res.body.data.updateReservation.id).toBe(reservationToUpdate.id)
    expect(res.body.data.updateReservation.name).toBe('updated name')
    expect(res.body.data.updateReservation.recurringId).toBeFalsy()
    const updatedRecord = await prisma.prismaReservation.findUnique({ where: { id: reservationToUpdate.id } })
    expect(updatedRecord.name).toBe('updated name')
    expect(updatedRecord.badminton).toBe(reservationToUpdate.badminton)
    expect(updatedRecord.tableTennis).toBe(reservationToUpdate.tableTennis)
    expect(updatedRecord.startTime).toEqual(reservationToUpdate.startTime)
    expect(updatedRecord.endTime).toEqual(reservationToUpdate.endTime)
    expect(prisma.$transaction).toHaveBeenCalledTimes(1)
    expect(prisma.prismaReservation.update).toHaveBeenCalledTimes(0)
    expect(prisma.prismaReservation.updateMany).toHaveBeenCalledTimes(0)
  })

  it('should return the updated reservation with all fields', async () => {
    const query = `mutation {
      updateReservation(
        id: "${reservationToUpdate.id}",
        updatedProperties: {
          name: "updated name"
        }
      ) {
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

    expect(res.body.data.updateReservation.id).toBe(reservationToUpdate.id)
    expect(res.body.data.updateReservation.name).toBe('updated name')
    expect(res.body.data.updateReservation.isActive).toBe(reservationToUpdate.isActive)
    expect(res.body.data.updateReservation.recurringId).toBeFalsy()
    expect(res.body.data.updateReservation.startTime).toBeTruthy()
    expect(res.body.data.updateReservation.endTime).toBeTruthy()
    expect(res.body.data.updateReservation.locations.tableTennis).toBe(reservationToUpdate.tableTennis)
    expect(res.body.data.updateReservation.locations.badminton).toBe(reservationToUpdate.badminton)
    expect(res.body.data.updateReservation.customer.name).toBe(customer.name)
    expect(res.body.data.updateReservation.customer.id).toBe(customer.id)
    expect(res.body.data.updateReservation.customer.role).toEqualCaseInsensitive(customer.role)
    expect(res.body.data.updateReservation.customer.user.id).toBe(user.id)
    expect(res.body.data.updateReservation.customer.user.email).toBe(user.email)
    expect(res.body.data.updateReservation.createdAt).toBeTruthy()
    expect(res.body.data.updateReservation.updatedAt).toBeTruthy()
  })

  it('should update the start time of a single reservation', async () => {
    const query = `mutation {
      updateReservation(
        id: "${reservationToUpdate.id}",
        updatedProperties: {
          startTime: "${new Date('2021-05-08 10:30')}"
        }
      ) {
        id
        startTime
      }
    }`

    const res = await request.post('/').send({ query }).set('Authorization', accessToken).expect(200)

    expect(res.body.data.updateReservation.id).toBe(reservationToUpdate.id)
    expect(res.body.data.updateReservation.startTime).toEqual(new Date('2021-05-08 10:30').toJSON())
    const updatedRecord = await prisma.prismaReservation.findUnique({ where: { id: reservationToUpdate.id } })
    expect(updatedRecord.name).toBe(reservationToUpdate.name)
    expect(updatedRecord.badminton).toBe(reservationToUpdate.badminton)
    expect(updatedRecord.tableTennis).toBe(reservationToUpdate.tableTennis)
    expect(updatedRecord.startTime).toEqual(new Date('2021-05-08 10:30'))
    expect(updatedRecord.endTime).toEqual(reservationToUpdate.endTime)
    expect(prisma.$transaction).toHaveBeenCalledTimes(2)
    expect(prisma.prismaReservation.update).toHaveBeenCalledTimes(0)
    expect(prisma.prismaReservation.updateMany).toHaveBeenCalledTimes(0)
  })

  it('should throw a PastTimeError if the start time is in the past', async () => {
    advanceTo('2021-05-08 9:00')
    const query = `mutation {
      updateReservation(
        id: "${reservationToUpdate.id}",
        updatedProperties: {
          startTime: "${new Date('2021-05-08 8:30')}"
        }
      ) {
        id
        startTime
      }
    }`

    const res = await request.post('/').send({ query }).set('Authorization', accessToken).expect(200)

    expect(res.body.errors[0].extensions.code).toBe('PAST_TIME')
    const updatedRecord = await prisma.prismaReservation.findUnique({ where: { id: reservationToUpdate.id } })
    expect(updatedRecord.name).toBe(reservationToUpdate.name)
    expect(updatedRecord.badminton).toBe(reservationToUpdate.badminton)
    expect(updatedRecord.tableTennis).toBe(reservationToUpdate.tableTennis)
    expect(updatedRecord.startTime).toEqual(reservationToUpdate.startTime)
    expect(updatedRecord.endTime).toEqual(reservationToUpdate.endTime)
    expect(prisma.$transaction).toHaveBeenCalledTimes(0)
    expect(prisma.prismaReservation.update).toHaveBeenCalledTimes(0)
    expect(prisma.prismaReservation.updateMany).toHaveBeenCalledTimes(0)
  })

  it('should update the end time of a single reservation', async () => {
    const query = `mutation {
      updateReservation(
        id: "${reservationToUpdate.id}",
        updatedProperties: {
          endTime: "${new Date('2021-05-08 11:30')}"
        }
      ) {
        id
        endTime
      }
    }`

    const res = await request.post('/').send({ query }).set('Authorization', accessToken).expect(200)

    expect(res.body.data.updateReservation.id).toBe(reservationToUpdate.id)
    expect(res.body.data.updateReservation.endTime).toEqual(new Date('2021-05-08 11:30').toJSON())
    const updatedRecord = await prisma.prismaReservation.findUnique({ where: { id: reservationToUpdate.id } })
    expect(updatedRecord.name).toBe(reservationToUpdate.name)
    expect(updatedRecord.badminton).toBe(reservationToUpdate.badminton)
    expect(updatedRecord.tableTennis).toBe(reservationToUpdate.tableTennis)
    expect(updatedRecord.startTime).toEqual(reservationToUpdate.startTime)
    expect(updatedRecord.endTime).toEqual(new Date('2021-05-08 11:30'))
    expect(prisma.$transaction).toHaveBeenCalledTimes(2)
    expect(prisma.prismaReservation.update).toHaveBeenCalledTimes(0)
    expect(prisma.prismaReservation.updateMany).toHaveBeenCalledTimes(0)
  })

  it('should throw a InvalidReservationTimeError if the end time is before the start time', async () => {
    const query = `mutation {
      updateReservation(
        id: "${reservationToUpdate.id}",
        updatedProperties: {
          endTime: "${new Date('2021-05-08 8:30')}"
        }
      ) {
        id
        endTime
      }
    }`

    const res = await request.post('/').send({ query }).set('Authorization', accessToken).expect(200)

    expect(res.body.errors[0].extensions.code).toBe('INVALID_TIME_SPAN')
    const updatedRecord = await prisma.prismaReservation.findUnique({ where: { id: reservationToUpdate.id } })
    expect(updatedRecord.name).toBe(reservationToUpdate.name)
    expect(updatedRecord.badminton).toBe(reservationToUpdate.badminton)
    expect(updatedRecord.tableTennis).toBe(reservationToUpdate.tableTennis)
    expect(updatedRecord.startTime).toEqual(reservationToUpdate.startTime)
    expect(updatedRecord.endTime).toEqual(reservationToUpdate.endTime)
    expect(prisma.$transaction).toHaveBeenCalledTimes(0)
    expect(prisma.prismaReservation.update).toHaveBeenCalledTimes(0)
    expect(prisma.prismaReservation.updateMany).toHaveBeenCalledTimes(0)
  })

  it('should update both the start and end time of a single reservation', async () => {
    const query = `mutation {
      updateReservation(
        id: "${reservationToUpdate.id}",
        updatedProperties: {
          startTime: "${new Date('2021-05-09 9:00')}",
          endTime: "${new Date('2021-05-09 10:30')}"
        }
      ) {
        id
        startTime
        endTime
      }
    }`

    const res = await request.post('/').send({ query }).set('Authorization', accessToken).expect(200)

    expect(res.body.data.updateReservation.id).toBe(reservationToUpdate.id)
    expect(res.body.data.updateReservation.startTime).toEqual(new Date('2021-05-09 9:00').toJSON())
    expect(res.body.data.updateReservation.endTime).toEqual(new Date('2021-05-09 10:30').toJSON())
    const updatedRecord = await prisma.prismaReservation.findUnique({ where: { id: reservationToUpdate.id } })
    expect(updatedRecord.name).toBe(reservationToUpdate.name)
    expect(updatedRecord.badminton).toBe(reservationToUpdate.badminton)
    expect(updatedRecord.tableTennis).toBe(reservationToUpdate.tableTennis)
    expect(updatedRecord.startTime).toEqual(new Date('2021-05-09 9:00'))
    expect(updatedRecord.endTime).toEqual(new Date('2021-05-09 10:30'))
    expect(prisma.$transaction).toHaveBeenCalledTimes(2)
    expect(prisma.prismaReservation.update).toHaveBeenCalledTimes(0)
    expect(prisma.prismaReservation.updateMany).toHaveBeenCalledTimes(0)
  })

  it('should throw a ReservationTimeError if the updated length is smaller than the minimum allowed', async () => {
    const startTime = new Date('2021-05-04 11:00')
    const endTime = new Date(startTime)
    endTime.setHours(endTime.getHours() + ReservationTime.MIN_RESERVATION_HOURS - 0.25)
    const query = `mutation {
      updateReservation(
        id: "${reservationToUpdate.id}",
        updatedProperties: {
          startTime: "${startTime}",
          endTime: "${endTime}"
        }
      ) {
        id
        startTime
        endTime
      }
    }`

    const res = await request.post('/').send({ query }).set('Authorization', accessToken).expect(200)

    expect(res.body.errors[0].extensions.code).toBe('INVALID_TIME_SPAN')
    const updatedRecord = await prisma.prismaReservation.findUnique({ where: { id: reservationToUpdate.id } })
    expect(updatedRecord.name).toBe(reservationToUpdate.name)
    expect(updatedRecord.badminton).toBe(reservationToUpdate.badminton)
    expect(updatedRecord.tableTennis).toBe(reservationToUpdate.tableTennis)
    expect(updatedRecord.startTime).toEqual(reservationToUpdate.startTime)
    expect(updatedRecord.endTime).toEqual(reservationToUpdate.endTime)
    expect(prisma.$transaction).toHaveBeenCalledTimes(0)
    expect(prisma.prismaReservation.update).toHaveBeenCalledTimes(0)
    expect(prisma.prismaReservation.updateMany).toHaveBeenCalledTimes(0)
  })

  it('should throw a ReservationTimeError if the updated length is longer than the maximum allowed', async () => {
    const startTime = new Date('2021-05-04 11:00')
    const endTime = addHours(startTime, ReservationTime.MAX_RESERVATION_HOURS + 1)
    const query = `mutation {
      updateReservation(
        id: "${reservationToUpdate.id}",
        updatedProperties: {
          startTime: "${startTime}",
          endTime: "${endTime}"
        }
      ) {
        id
        startTime
        endTime
      }
    }`

    const res = await request.post('/').send({ query }).set('Authorization', accessToken).expect(200)

    expect(res.body.errors[0].extensions.code).toBe('INVALID_TIME_SPAN')
    const updatedRecord = await prisma.prismaReservation.findUnique({ where: { id: reservationToUpdate.id } })
    expect(updatedRecord.name).toBe(reservationToUpdate.name)
    expect(updatedRecord.badminton).toBe(reservationToUpdate.badminton)
    expect(updatedRecord.tableTennis).toBe(reservationToUpdate.tableTennis)
    expect(updatedRecord.startTime).toEqual(reservationToUpdate.startTime)
    expect(updatedRecord.endTime).toEqual(reservationToUpdate.endTime)
    expect(prisma.$transaction).toHaveBeenCalledTimes(0)
    expect(prisma.prismaReservation.update).toHaveBeenCalledTimes(0)
    expect(prisma.prismaReservation.updateMany).toHaveBeenCalledTimes(0)
  })

  it('should throw a TimeNotAvailableError if the new time is not available', async () => {
    await prisma.prismaReservation.create({
      data: {
        id: new UniqueID().toString(),
        name: 'Collapsing reservation',
        startTime: new Date('2021-05-09 10:00:00'),
        endTime: new Date('2021-05-09 11:30:00'),
        badminton: true,
        tableTennis: true,
        customerId: customer.id,
        isActive: true,
      },
    })
    const query = `mutation {
      updateReservation(
        id: "${reservationToUpdate.id}",
        updatedProperties: {
          startTime: "${new Date('2021-05-09 9:00')}",
          endTime: "${new Date('2021-05-09 10:30')}"
        }
      ) {
        id
        startTime
        endTime
      }
    }`

    const res = await request.post('/').send({ query }).set('Authorization', accessToken).expect(200)

    expect(res.body.errors[0].extensions.code).toBe('TIME_NOT_AVAILABLE')
    const updatedRecord = await prisma.prismaReservation.findUnique({ where: { id: reservationToUpdate.id } })
    expect(updatedRecord.name).toBe(reservationToUpdate.name)
    expect(updatedRecord.badminton).toBe(reservationToUpdate.badminton)
    expect(updatedRecord.tableTennis).toBe(reservationToUpdate.tableTennis)
    expect(updatedRecord.startTime).toEqual(reservationToUpdate.startTime)
    expect(updatedRecord.endTime).toEqual(reservationToUpdate.endTime)
    expect(prisma.$transaction).toHaveBeenCalledTimes(1)
    expect(AreTimesAvailableUseCase.prototype.execute).toHaveBeenCalledTimes(1)
    expect(prisma.prismaReservation.update).toHaveBeenCalledTimes(0)
    expect(prisma.prismaReservation.updateMany).toHaveBeenCalledTimes(0)
  })

  it('should de-activate a single reservation', async () => {
    const query = `mutation {
      updateReservation(
        id: "${reservationToUpdate.id}",
        updatedProperties: {
          isActive: false
        }
      ) {
        id
        isActive
      }
    }`

    const res = await request.post('/').send({ query }).set('Authorization', accessToken).expect(200)

    expect(res.body.data.updateReservation.id).toBe(reservationToUpdate.id)
    expect(res.body.data.updateReservation.isActive).toBe(false)
    const updatedRecord = await prisma.prismaReservation.findUnique({ where: { id: reservationToUpdate.id } })
    expect(updatedRecord.name).toBe(reservationToUpdate.name)
    expect(updatedRecord.badminton).toBe(reservationToUpdate.badminton)
    expect(updatedRecord.tableTennis).toBe(reservationToUpdate.tableTennis)
    expect(updatedRecord.startTime).toEqual(reservationToUpdate.startTime)
    expect(updatedRecord.endTime).toEqual(reservationToUpdate.endTime)
    expect(updatedRecord.isActive).toBe(false)
    expect(prisma.$transaction).toHaveBeenCalledTimes(2)
    expect(prisma.prismaReservation.update).toHaveBeenCalledTimes(0)
    expect(prisma.prismaReservation.updateMany).toHaveBeenCalledTimes(0)
  })

  it('should update both locations of a single reservation', async () => {
    const query = `mutation {
      updateReservation(
        id: "${reservationToUpdate.id}",
        updatedProperties: {
          locations: {
            badminton: false,
            tableTennis: true
          }
        }
      ) {
        id
        locations {
          badminton
          tableTennis
        }
      }
    }`

    const res = await request.post('/').send({ query }).set('Authorization', accessToken).expect(200)

    expect(res.body.data.updateReservation.id).toBe(reservationToUpdate.id)
    expect(res.body.data.updateReservation.locations.badminton).toBe(false)
    expect(res.body.data.updateReservation.locations.tableTennis).toBe(true)
    const updatedRecord = await prisma.prismaReservation.findUnique({ where: { id: reservationToUpdate.id } })
    expect(updatedRecord.name).toBe(reservationToUpdate.name)
    expect(updatedRecord.badminton).toBe(false)
    expect(updatedRecord.tableTennis).toBe(true)
    expect(updatedRecord.startTime).toEqual(reservationToUpdate.startTime)
    expect(updatedRecord.endTime).toEqual(reservationToUpdate.endTime)
    expect(updatedRecord.isActive).toBe(true)
    expect(prisma.$transaction).toHaveBeenCalledTimes(2)
    expect(prisma.prismaReservation.update).toHaveBeenCalledTimes(0)
    expect(prisma.prismaReservation.updateMany).toHaveBeenCalledTimes(0)
  })

  it('should update only a single location of a single reservation', async () => {
    const query = `mutation {
      updateReservation(
        id: "${reservationToUpdate.id}",
        updatedProperties: {
          locations: {
            tableTennis: true
          }
        }
      ) {
        id
        locations {
          badminton
          tableTennis
        }
      }
    }`

    const res = await request.post('/').send({ query }).set('Authorization', accessToken).expect(200)

    expect(res.body.data.updateReservation.id).toBe(reservationToUpdate.id)
    expect(res.body.data.updateReservation.locations.badminton).toBe(true)
    expect(res.body.data.updateReservation.locations.tableTennis).toBe(true)
    const updatedRecord = await prisma.prismaReservation.findUnique({ where: { id: reservationToUpdate.id } })
    expect(updatedRecord.name).toBe(reservationToUpdate.name)
    expect(updatedRecord.badminton).toBe(true)
    expect(updatedRecord.tableTennis).toBe(true)
    expect(updatedRecord.startTime).toEqual(reservationToUpdate.startTime)
    expect(updatedRecord.endTime).toEqual(reservationToUpdate.endTime)
    expect(updatedRecord.isActive).toBe(true)
    expect(prisma.$transaction).toHaveBeenCalledTimes(2)
    expect(prisma.prismaReservation.update).toHaveBeenCalledTimes(0)
    expect(prisma.prismaReservation.updateMany).toHaveBeenCalledTimes(0)
  })

  it('should throw a TimeNotAvailableError if the updated location is not available', async () => {
    await prisma.prismaReservation.create({
      data: {
        id: new UniqueID().toString(),
        name: 'Collapsing reservation',
        startTime: new Date('2021-05-08 10:30:00'),
        endTime: new Date('2021-05-08 12:30:00'),
        badminton: false,
        tableTennis: true,
        customerId: customer.id,
        isActive: true,
      },
    })
    const query = `mutation {
      updateReservation(
        id: "${reservationToUpdate.id}",
        updatedProperties: {
          locations: {
            tableTennis: true
          }
        }
      ) {
        id
      }
    }`

    const res = await request.post('/').send({ query }).set('Authorization', accessToken).expect(200)

    expect(res.body.errors[0].extensions.code).toBe('TIME_NOT_AVAILABLE')
    const updatedRecord = await prisma.prismaReservation.findUnique({ where: { id: reservationToUpdate.id } })
    expect(updatedRecord.name).toBe(reservationToUpdate.name)
    expect(updatedRecord.badminton).toBe(reservationToUpdate.badminton)
    expect(updatedRecord.tableTennis).toBe(reservationToUpdate.tableTennis)
    expect(updatedRecord.startTime).toEqual(reservationToUpdate.startTime)
    expect(updatedRecord.endTime).toEqual(reservationToUpdate.endTime)
    expect(prisma.$transaction).toHaveBeenCalledTimes(1)
    expect(AreTimesAvailableUseCase.prototype.execute).toHaveBeenCalledTimes(1)
    expect(prisma.prismaReservation.update).toHaveBeenCalledTimes(0)
    expect(prisma.prismaReservation.updateMany).toHaveBeenCalledTimes(0)
  })

  it('should throw an InvalidOrMissingAccessTokenError if no access token is provided', async () => {
    const query = `mutation {
      updateReservation(
        id: "${reservationToUpdate.id}",
        updatedProperties: {
          startTime: "${new Date('2021-05-09 9:00')}",
          endTime: "${new Date('2021-05-09 10:30')}"
        }
      ) {
        id
        startTime
        endTime
      }
    }`

    const res = await request.post('/').send({ query }).expect(200)

    expect(res.body.errors[0].extensions.code).toBe('INVALID_ACCESS_TOKEN')
    const updatedRecord = await prisma.prismaReservation.findUnique({ where: { id: reservationToUpdate.id } })
    expect(updatedRecord.name).toBe(reservationToUpdate.name)
    expect(updatedRecord.badminton).toBe(reservationToUpdate.badminton)
    expect(updatedRecord.tableTennis).toBe(reservationToUpdate.tableTennis)
    expect(updatedRecord.startTime).toEqual(reservationToUpdate.startTime)
    expect(updatedRecord.endTime).toEqual(reservationToUpdate.endTime)
    expect(prisma.$transaction).toHaveBeenCalledTimes(0)
    expect(AreTimesAvailableUseCase.prototype.execute).toHaveBeenCalledTimes(0)
    expect(prisma.prismaReservation.update).toHaveBeenCalledTimes(0)
    expect(prisma.prismaReservation.updateMany).toHaveBeenCalledTimes(0)
  })

  it('should throw a GraphQL validation error if no ID is provided', async () => {
    const query = `mutation {
      updateReservation(
        updatedProperties: {
          startTime: "${new Date('2021-05-09 9:00')}",
          endTime: "${new Date('2021-05-09 10:30')}"
        }
      ) {
        id
        startTime
        endTime
      }
    }`

    const res = await request.post('/').send({ query }).set('Authorization', accessToken).expect(400)

    expect(res.body.errors[0].extensions.code).toBe('GRAPHQL_VALIDATION_FAILED')
    const updatedRecord = await prisma.prismaReservation.findUnique({ where: { id: reservationToUpdate.id } })
    expect(updatedRecord.name).toBe(reservationToUpdate.name)
    expect(updatedRecord.badminton).toBe(reservationToUpdate.badminton)
    expect(updatedRecord.tableTennis).toBe(reservationToUpdate.tableTennis)
    expect(updatedRecord.startTime).toEqual(reservationToUpdate.startTime)
    expect(updatedRecord.endTime).toEqual(reservationToUpdate.endTime)
    expect(prisma.$transaction).toHaveBeenCalledTimes(0)
    expect(AreTimesAvailableUseCase.prototype.execute).toHaveBeenCalledTimes(0)
    expect(prisma.prismaReservation.update).toHaveBeenCalledTimes(0)
    expect(prisma.prismaReservation.updateMany).toHaveBeenCalledTimes(0)
  })

  it('should throw a GraphQL validation error if the customer property is updated', async () => {
    const query = `mutation {
      updateReservation(
        id: "${reservationToUpdate.id}",
        updatedProperties: {
          startTime: "${new Date('2021-05-09 9:00')}",
          endTime: "${new Date('2021-05-09 10:30')}",
          customer: "foo"
        }
      ) {
        id
        startTime
        endTime
      }
    }`

    const res = await request.post('/').send({ query }).set('Authorization', accessToken).expect(400)

    expect(res.body.errors[0].extensions.code).toBe('GRAPHQL_VALIDATION_FAILED')
    const updatedRecord = await prisma.prismaReservation.findUnique({ where: { id: reservationToUpdate.id } })
    expect(updatedRecord.name).toBe(reservationToUpdate.name)
    expect(updatedRecord.badminton).toBe(reservationToUpdate.badminton)
    expect(updatedRecord.tableTennis).toBe(reservationToUpdate.tableTennis)
    expect(updatedRecord.startTime).toEqual(reservationToUpdate.startTime)
    expect(updatedRecord.endTime).toEqual(reservationToUpdate.endTime)
    expect(prisma.$transaction).toHaveBeenCalledTimes(0)
    expect(AreTimesAvailableUseCase.prototype.execute).toHaveBeenCalledTimes(0)
    expect(prisma.prismaReservation.update).toHaveBeenCalledTimes(0)
    expect(prisma.prismaReservation.updateMany).toHaveBeenCalledTimes(0)
  })

  it('should throw a GraphQL validation error if the customerId property is updated', async () => {
    const query = `mutation {
      updateReservation(
        id: "${reservationToUpdate.id}",
        updatedProperties: {
          startTime: "${new Date('2021-05-09 9:00')}",
          endTime: "${new Date('2021-05-09 10:30')}",
          customerId: "foo"
        }
      ) {
        id
        startTime
        endTime
      }
    }`

    const res = await request.post('/').send({ query }).set('Authorization', accessToken).expect(400)

    expect(res.body.errors[0].extensions.code).toBe('GRAPHQL_VALIDATION_FAILED')
    const updatedRecord = await prisma.prismaReservation.findUnique({ where: { id: reservationToUpdate.id } })
    expect(updatedRecord.name).toBe(reservationToUpdate.name)
    expect(updatedRecord.badminton).toBe(reservationToUpdate.badminton)
    expect(updatedRecord.tableTennis).toBe(reservationToUpdate.tableTennis)
    expect(updatedRecord.startTime).toEqual(reservationToUpdate.startTime)
    expect(updatedRecord.endTime).toEqual(reservationToUpdate.endTime)
    expect(updatedRecord.customerId).toBe(customer.id)
    expect(prisma.$transaction).toHaveBeenCalledTimes(0)
    expect(AreTimesAvailableUseCase.prototype.execute).toHaveBeenCalledTimes(0)
    expect(prisma.prismaReservation.update).toHaveBeenCalledTimes(0)
    expect(prisma.prismaReservation.updateMany).toHaveBeenCalledTimes(0)
  })

  it('should throw a GraphQL validation error if the createdAt property is updated', async () => {
    const query = `mutation {
      updateReservation(
        id: "${reservationToUpdate.id}",
        updatedProperties: {
          startTime: "${new Date('2021-05-09 9:00')}",
          endTime: "${new Date('2021-05-09 10:30')}",
          createdAt: "${new Date()}"
        }
      ) {
        id
        startTime
        endTime
      }
    }`

    const res = await request.post('/').send({ query }).set('Authorization', accessToken).expect(400)

    expect(res.body.errors[0].extensions.code).toBe('GRAPHQL_VALIDATION_FAILED')
    const updatedRecord = await prisma.prismaReservation.findUnique({ where: { id: reservationToUpdate.id } })
    expect(updatedRecord.name).toBe(reservationToUpdate.name)
    expect(updatedRecord.badminton).toBe(reservationToUpdate.badminton)
    expect(updatedRecord.tableTennis).toBe(reservationToUpdate.tableTennis)
    expect(updatedRecord.startTime).toEqual(reservationToUpdate.startTime)
    expect(updatedRecord.endTime).toEqual(reservationToUpdate.endTime)
    expect(prisma.$transaction).toHaveBeenCalledTimes(0)
    expect(AreTimesAvailableUseCase.prototype.execute).toHaveBeenCalledTimes(0)
    expect(prisma.prismaReservation.update).toHaveBeenCalledTimes(0)
    expect(prisma.prismaReservation.updateMany).toHaveBeenCalledTimes(0)
  })

  it('should throw a GraphQL validation error if the updatedAt property is updated', async () => {
    const query = `mutation {
      updateReservation(
        id: "${reservationToUpdate.id}",
        updatedProperties: {
          startTime: "${new Date('2021-05-09 9:00')}",
          endTime: "${new Date('2021-05-09 10:30')}",
          updatedAt: "${new Date()}"
        }
      ) {
        id
        startTime
        endTime
      }
    }`

    const res = await request.post('/').send({ query }).set('Authorization', accessToken).expect(400)

    expect(res.body.errors[0].extensions.code).toBe('GRAPHQL_VALIDATION_FAILED')
    const updatedRecord = await prisma.prismaReservation.findUnique({ where: { id: reservationToUpdate.id } })
    expect(updatedRecord.name).toBe(reservationToUpdate.name)
    expect(updatedRecord.badminton).toBe(reservationToUpdate.badminton)
    expect(updatedRecord.tableTennis).toBe(reservationToUpdate.tableTennis)
    expect(updatedRecord.startTime).toEqual(reservationToUpdate.startTime)
    expect(updatedRecord.endTime).toEqual(reservationToUpdate.endTime)
    expect(prisma.$transaction).toHaveBeenCalledTimes(0)
    expect(AreTimesAvailableUseCase.prototype.execute).toHaveBeenCalledTimes(0)
    expect(prisma.prismaReservation.update).toHaveBeenCalledTimes(0)
    expect(prisma.prismaReservation.updateMany).toHaveBeenCalledTimes(0)
  })

  it('should throw a ReservationNotAuthorizedError if the reservation does not belong to the user', async () => {
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
      config.auth.jwtSecretKey
    )
    const query = `mutation {
      updateReservation(
        id: "${reservationToUpdate.id}",
        updatedProperties: {
          startTime: "${new Date('2021-05-09 9:00')}",
          endTime: "${new Date('2021-05-09 10:30')}",
        }
      ) {
        id
        startTime
        endTime
      }
    }`

    const res = await request.post('/').send({ query }).set('Authorization', otherUserAccessToken).expect(200)

    expect(res.body.errors[0].extensions.code).toBe('RESERVATION_NOT_AUTHORIZED')
    const updatedRecord = await prisma.prismaReservation.findUnique({ where: { id: reservationToUpdate.id } })
    expect(updatedRecord.name).toBe(reservationToUpdate.name)
    expect(updatedRecord.badminton).toBe(reservationToUpdate.badminton)
    expect(updatedRecord.tableTennis).toBe(reservationToUpdate.tableTennis)
    expect(updatedRecord.startTime).toEqual(reservationToUpdate.startTime)
    expect(updatedRecord.endTime).toEqual(reservationToUpdate.endTime)
    expect(prisma.$transaction).toHaveBeenCalledTimes(0)
    expect(AreTimesAvailableUseCase.prototype.execute).toHaveBeenCalledTimes(0)
    expect(prisma.prismaReservation.update).toHaveBeenCalledTimes(0)
    expect(prisma.prismaReservation.updateMany).toHaveBeenCalledTimes(0)
  })

  it('should not throw a ReservationNotAuthorizedError if the reservation does not belong to the user, yet the user is an admin', async () => {
    const query = `mutation {
        updateReservation(
          id: "${reservationToUpdate.id}",
          updatedProperties: {
            name: "updated name"
          }
        ) {
          id
          name
        }
      }`

    const res = await request.post('/').send({ query }).set('Authorization', adminAccessToken).expect(200)

    expect(res.body.data.updateReservation.id).toBe(reservationToUpdate.id)
    expect(res.body.data.updateReservation.name).toBe('updated name')
    const updatedRecord = await prisma.prismaReservation.findUnique({ where: { id: reservationToUpdate.id } })
    expect(updatedRecord.name).toBe('updated name')
    expect(updatedRecord.badminton).toBe(reservationToUpdate.badminton)
    expect(updatedRecord.tableTennis).toBe(reservationToUpdate.tableTennis)
    expect(updatedRecord.startTime).toEqual(reservationToUpdate.startTime)
    expect(updatedRecord.endTime).toEqual(reservationToUpdate.endTime)
    expect(prisma.$transaction).toHaveBeenCalledTimes(1)
    expect(AreTimesAvailableUseCase.prototype.execute).toHaveBeenCalledTimes(0)
    expect(prisma.prismaReservation.update).toHaveBeenCalledTimes(0)
    expect(prisma.prismaReservation.updateMany).toHaveBeenCalledTimes(0)
  })

  it('should update the name of the connected reservations as well', async () => {
    const query = `mutation {
      updateReservation(
        id: "${reservationToUpdate.id}",
        updatedProperties: {
          name: "updated name"
        },
        connectedUpdates: [
          "${reservations[2].id}"
        ]
      ) {
        id
        name
      }
    }`

    const res = await request.post('/').send({ query }).set('Authorization', accessToken).expect(200)

    expect(res.body.data.updateReservation.id).toBe(reservationToUpdate.id)
    expect(res.body.data.updateReservation.name).toBe('updated name')
    const updatedRecord = await prisma.prismaReservation.findUnique({ where: { id: reservationToUpdate.id } })
    expect(updatedRecord.name).toBe('updated name')
    expect(updatedRecord.badminton).toBe(reservationToUpdate.badminton)
    expect(updatedRecord.tableTennis).toBe(reservationToUpdate.tableTennis)
    expect(updatedRecord.startTime).toEqual(reservationToUpdate.startTime)
    expect(updatedRecord.endTime).toEqual(reservationToUpdate.endTime)
    const connectedUpdatedRecord = await prisma.prismaReservation.findUnique({ where: { id: reservations[2].id } })
    expect(connectedUpdatedRecord.name).toBe('updated name')
    expect(connectedUpdatedRecord.badminton).toBe(reservations[2].badminton)
    expect(connectedUpdatedRecord.tableTennis).toBe(reservations[2].tableTennis)
    expect(connectedUpdatedRecord.startTime).toEqual(reservations[2].startTime)
    expect(connectedUpdatedRecord.endTime).toEqual(reservations[2].endTime)
    expect(prisma.$transaction).toHaveBeenCalledTimes(1)
    expect(AreTimesAvailableUseCase.prototype.execute).toHaveBeenCalledTimes(0)
    expect(prisma.prismaReservation.update).toHaveBeenCalledTimes(0)
    expect(prisma.prismaReservation.updateMany).toHaveBeenCalledTimes(0)
  })

  it('should update the location of the connected reservations as well', async () => {
    const query = `mutation {
      updateReservation(
        id: "${reservationToUpdate.id}",
        updatedProperties: {
          locations: {
            tableTennis: true,
            badminton: false
          }
        },
        connectedUpdates: [
          "${reservations[2].id}"
        ]
      ) {
        id
        locations {
          badminton
          tableTennis
        }
      }
    }`

    const res = await request.post('/').send({ query }).set('Authorization', accessToken).expect(200)

    expect(res.body.data.updateReservation.id).toBe(reservationToUpdate.id)
    expect(res.body.data.updateReservation.locations.tableTennis).toBe(true)
    expect(res.body.data.updateReservation.locations.badminton).toBe(false)
    const updatedRecord = await prisma.prismaReservation.findUnique({ where: { id: reservationToUpdate.id } })
    expect(updatedRecord.name).toBe(reservationToUpdate.name)
    expect(updatedRecord.badminton).toBe(false)
    expect(updatedRecord.tableTennis).toBe(true)
    expect(updatedRecord.startTime).toEqual(reservationToUpdate.startTime)
    expect(updatedRecord.endTime).toEqual(reservationToUpdate.endTime)
    const connectedUpdatedRecord = await prisma.prismaReservation.findUnique({ where: { id: reservations[2].id } })
    expect(connectedUpdatedRecord.name).toBe(reservations[2].name)
    expect(connectedUpdatedRecord.badminton).toBe(false)
    expect(connectedUpdatedRecord.tableTennis).toBe(true)
    expect(connectedUpdatedRecord.startTime).toEqual(reservations[2].startTime)
    expect(connectedUpdatedRecord.endTime).toEqual(reservations[2].endTime)
    expect(prisma.$transaction).toHaveBeenCalledTimes(2)
    expect(AreTimesAvailableUseCase.prototype.execute).toHaveBeenCalledTimes(1)
    expect(prisma.prismaReservation.update).toHaveBeenCalledTimes(0)
    expect(prisma.prismaReservation.updateMany).toHaveBeenCalledTimes(0)
  })

  it('should update the start time of the connected reservations with the original difference', async () => {
    const query = `mutation {
      updateReservation(
        id: "${reservationToUpdate.id}",
        updatedProperties: {
          startTime: "${new Date('2021-05-08 10:30')}"
        },
        connectedUpdates: [
          "${reservations[2].id}",
        ]
      ) {
        id
        startTime
      }
    }`

    const res = await request.post('/').send({ query }).set('Authorization', accessToken).expect(200)

    expect(res.body.data.updateReservation.id).toBe(reservationToUpdate.id)
    expect(res.body.data.updateReservation.startTime).toEqual(new Date('2021-05-08 10:30').toJSON())
    const updatedRecord = await prisma.prismaReservation.findUnique({ where: { id: reservationToUpdate.id } })
    expect(updatedRecord.name).toBe(reservationToUpdate.name)
    expect(updatedRecord.badminton).toBe(true)
    expect(updatedRecord.tableTennis).toBe(false)
    expect(updatedRecord.startTime).toEqual(new Date('2021-05-08 10:30'))
    expect(updatedRecord.endTime).toEqual(reservationToUpdate.endTime)
    const connectedUpdatedRecord = await prisma.prismaReservation.findUnique({ where: { id: reservations[2].id } })
    expect(connectedUpdatedRecord.name).toBe(reservations[2].name)
    expect(connectedUpdatedRecord.badminton).toBe(true)
    expect(connectedUpdatedRecord.tableTennis).toBe(false)
    expect(connectedUpdatedRecord.startTime).toEqual(add(reservations[2].startTime, { minutes: 30 }))
    expect(connectedUpdatedRecord.endTime).toEqual(reservations[2].endTime)
    expect(prisma.$transaction).toHaveBeenCalledTimes(2)
    expect(AreTimesAvailableUseCase.prototype.execute).toHaveBeenCalledTimes(1)
    expect(prisma.prismaReservation.update).toHaveBeenCalledTimes(0)
    expect(prisma.prismaReservation.updateMany).toHaveBeenCalledTimes(0)
  })

  it('should update the end time of the connected reservation with the original difference', async () => {
    const query = `mutation {
      updateReservation(
        id: "${reservationToUpdate.id}",
        updatedProperties: {
          endTime: "${new Date('2021-05-08 13:00')}"
        },
        connectedUpdates: [
          "${reservations[2].id}",
        ]
      ) {
        id
        endTime
      }
    }`

    const res = await request.post('/').send({ query }).set('Authorization', accessToken).expect(200)

    expect(res.body.data.updateReservation.id).toBe(reservationToUpdate.id)
    expect(res.body.data.updateReservation.endTime).toEqual(new Date('2021-05-08 13:00').toJSON())
    const updatedRecord = await prisma.prismaReservation.findUnique({ where: { id: reservationToUpdate.id } })
    expect(updatedRecord.name).toBe(reservationToUpdate.name)
    expect(updatedRecord.badminton).toBe(true)
    expect(updatedRecord.tableTennis).toBe(false)
    expect(updatedRecord.startTime).toEqual(reservationToUpdate.startTime)
    expect(updatedRecord.endTime).toEqual(new Date('2021-05-08 13:00'))
    const connectedUpdatedRecord = await prisma.prismaReservation.findUnique({ where: { id: reservations[2].id } })
    expect(connectedUpdatedRecord.name).toBe(reservations[2].name)
    expect(connectedUpdatedRecord.badminton).toBe(true)
    expect(connectedUpdatedRecord.tableTennis).toBe(false)
    expect(connectedUpdatedRecord.startTime).toEqual(reservations[2].startTime)
    expect(connectedUpdatedRecord.endTime).toEqual(add(reservations[2].endTime, { hours: 1 }))
    expect(prisma.$transaction).toHaveBeenCalledTimes(2)
    expect(AreTimesAvailableUseCase.prototype.execute).toHaveBeenCalledTimes(1)
    expect(prisma.prismaReservation.update).toHaveBeenCalledTimes(0)
    expect(prisma.prismaReservation.updateMany).toHaveBeenCalledTimes(0)
  })

  it('should throw a TimeNotAvailableError if at least one of the connected updates are not available', async () => {
    await prisma.prismaReservation.create({
      data: {
        id: new UniqueID().toString(),
        name: 'Collapsing',
        startTime: new Date('2021-05-22 9:00:00'),
        endTime: new Date('2021-05-22 12:00:00'),
        badminton: true,
        tableTennis: false,
        customerId: customer.id,
        isActive: true,
      },
    })
    const query = `mutation {
      updateReservation(
        id: "${reservationToUpdate.id}",
        updatedProperties: {
          startTime: "${new Date('2021-05-08 10:30')}"
        },
        connectedUpdates: [
          "${reservations[2].id}",
          "${reservations[3].id}"
        ]
      ) {
        id
        startTime
      }
    }`

    const res = await request.post('/').send({ query }).set('Authorization', accessToken).expect(200)

    expect(res.body.errors[0].extensions.code).toBe('TIME_NOT_AVAILABLE')
    const updatedRecord = await prisma.prismaReservation.findUnique({ where: { id: reservationToUpdate.id } })
    expect(updatedRecord.name).toBe(reservationToUpdate.name)
    expect(updatedRecord.badminton).toBe(true)
    expect(updatedRecord.tableTennis).toBe(false)
    expect(updatedRecord.startTime).toEqual(reservationToUpdate.startTime)
    expect(updatedRecord.endTime).toEqual(reservationToUpdate.endTime)
    const connectedUpdatedRecord = await prisma.prismaReservation.findUnique({ where: { id: reservations[2].id } })
    expect(connectedUpdatedRecord.name).toBe(reservations[2].name)
    expect(connectedUpdatedRecord.badminton).toBe(true)
    expect(connectedUpdatedRecord.tableTennis).toBe(false)
    expect(connectedUpdatedRecord.startTime).toEqual(reservations[2].startTime)
    expect(connectedUpdatedRecord.endTime).toEqual(reservations[2].endTime)
    expect(prisma.$transaction).toHaveBeenCalledTimes(1)
    expect(AreTimesAvailableUseCase.prototype.execute).toHaveBeenCalledTimes(1)
    expect(prisma.prismaReservation.update).toHaveBeenCalledTimes(0)
    expect(prisma.prismaReservation.updateMany).toHaveBeenCalledTimes(0)
  })

  it('should throw ReservationNotAuthorized if a past reservation is being updated', async () => {
    const query = `mutation {
      updateReservation(
        id: "${reservations[0].id}",
        updatedProperties: {
          name: "updated name"
        }
      ) {
        id
        recurringId
        name
      }
    }`

    const res = await request.post('/').send({ query }).set('Authorization', accessToken).expect(200)

    expect(res.body.errors[0].extensions.code).toBe('RESERVATION_NOT_AUTHORIZED')
    const updatedRecord = await prisma.prismaReservation.findUnique({ where: { id: reservations[0].id } })
    expect(updatedRecord.name).toBe(reservations[0].name)
    expect(updatedRecord.badminton).toBe(reservations[0].badminton)
    expect(updatedRecord.tableTennis).toBe(reservations[0].tableTennis)
    expect(updatedRecord.startTime).toEqual(reservations[0].startTime)
    expect(updatedRecord.endTime).toEqual(reservations[0].endTime)
    expect(prisma.$transaction).toHaveBeenCalledTimes(0)
    expect(AreTimesAvailableUseCase.prototype.execute).toHaveBeenCalledTimes(0)
    expect(prisma.prismaReservation.update).toHaveBeenCalledTimes(0)
    expect(prisma.prismaReservation.updateMany).toHaveBeenCalledTimes(0)
  })

  it('should allow admins to edit past reservations', async () => {
    const query = `mutation {
      updateReservation(
        id: "${reservations[0].id}",
        updatedProperties: {
          name: "updated name"
        }
      ) {
        id
        name
      }
    }`

    const res = await request.post('/').send({ query }).set('Authorization', adminAccessToken).expect(200)

    expect(res.body.data.updateReservation.name).toBe('updated name')
    const updatedRecord = await prisma.prismaReservation.findUnique({ where: { id: reservations[0].id } })
    expect(updatedRecord.name).toBe('updated name')
    expect(updatedRecord.badminton).toBe(reservations[0].badminton)
    expect(updatedRecord.tableTennis).toBe(reservations[0].tableTennis)
    expect(updatedRecord.startTime).toEqual(reservations[0].startTime)
    expect(updatedRecord.endTime).toEqual(reservations[0].endTime)
    expect(prisma.$transaction).toHaveBeenCalledTimes(1)
    expect(AreTimesAvailableUseCase.prototype.execute).toHaveBeenCalledTimes(0)
    expect(prisma.prismaReservation.update).toHaveBeenCalledTimes(0)
    expect(prisma.prismaReservation.updateMany).toHaveBeenCalledTimes(0)
  })

  it('should throw ReservationNotAuthorized if an inactive reservation is updated', async () => {
    await prisma.prismaReservation.update({ where: { id: reservationToUpdate.id }, data: { isActive: false } })
    jest.clearAllMocks()
    const query = `mutation {
      updateReservation(
        id: "${reservationToUpdate.id}",
        updatedProperties: {
          name: "updated name"
        }
      ) {
        id
        recurringId
        name
      }
    }`

    const res = await request.post('/').send({ query }).set('Authorization', accessToken).expect(200)

    expect(res.body.errors[0].extensions.code).toBe('RESERVATION_NOT_AUTHORIZED')
    const updatedRecord = await prisma.prismaReservation.findUnique({ where: { id: reservationToUpdate.id } })
    expect(updatedRecord.name).toBe(reservationToUpdate.name)
    expect(updatedRecord.badminton).toBe(reservationToUpdate.badminton)
    expect(updatedRecord.tableTennis).toBe(reservationToUpdate.tableTennis)
    expect(updatedRecord.startTime).toEqual(reservationToUpdate.startTime)
    expect(updatedRecord.endTime).toEqual(reservationToUpdate.endTime)
    expect(prisma.$transaction).toHaveBeenCalledTimes(0)
    expect(AreTimesAvailableUseCase.prototype.execute).toHaveBeenCalledTimes(0)
    expect(prisma.prismaReservation.update).toHaveBeenCalledTimes(0)
    expect(prisma.prismaReservation.updateMany).toHaveBeenCalledTimes(0)
  })

  it('should allow admins to update inactive reservations', async () => {
    await prisma.prismaReservation.update({ where: { id: reservationToUpdate.id }, data: { isActive: false } })
    jest.clearAllMocks()
    const query = `mutation {
      updateReservation(
        id: "${reservationToUpdate.id}",
        updatedProperties: {
          name: "updated name"
        }
      ) {
        id
        recurringId
        name
      }
    }`

    const res = await request.post('/').send({ query }).set('Authorization', adminAccessToken).expect(200)

    expect(res.body.data.updateReservation.name).toBe('updated name')
    const updatedRecord = await prisma.prismaReservation.findUnique({ where: { id: reservationToUpdate.id } })
    expect(updatedRecord.name).toBe('updated name')
    expect(updatedRecord.badminton).toBe(reservationToUpdate.badminton)
    expect(updatedRecord.tableTennis).toBe(reservationToUpdate.tableTennis)
    expect(updatedRecord.startTime).toEqual(reservationToUpdate.startTime)
    expect(updatedRecord.endTime).toEqual(reservationToUpdate.endTime)
    expect(prisma.$transaction).toHaveBeenCalledTimes(1)
    expect(AreTimesAvailableUseCase.prototype.execute).toHaveBeenCalledTimes(0)
    expect(prisma.prismaReservation.update).toHaveBeenCalledTimes(0)
    expect(prisma.prismaReservation.updateMany).toHaveBeenCalledTimes(0)
  })
})

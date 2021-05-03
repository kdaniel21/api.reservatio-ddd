import { PrismaUser, PrismaCustomer } from '@prisma/client'
import { InitializedApolloServer, initApolloServer } from '@shared/infra/http/apollo/initApolloServer'
import supertest from 'supertest'

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

  it(`should create a recurring reservation based on the 'availableTimes' property of the validator use case result`)

  it('should persist the created reservations to the DB')

  it(`should assign the same 'recurringId' to all created reservations in the DB`)

  it(`should create a recurring reservation for multiple locations for the dates returned by 'IsRecurringTimeAvailable'`, async () => {})

  it('should persist the multi-location reservation to the DB')

  it('should throw an the same error if the validator use case fails')

  it('should throw an InvalidOrMissingAccessTokenError if no access token is provided', async () => {})

  it(`should throw an InvalidReservationNameError if the 'name' is shorter than the minimum length`)

  it(`should throw an InvalidReservationNameError if the 'name' is longer than the maximum length`)

  it('should throw an PastTimeError if the reservation starts in the past')

  it('should throw an InvalidReservationTimeError if the reservation length is less than the minimum allowed')

  it('should throw an InvalidReservationTimeError if the reservation length exceeds the maximum allowed')

  it(`should throw an InvalidReservationTimeError if 'startTime' is later in time than 'endTime'`)

  it('should throw a InvalidReservationLocationError if both locations are false')

  it(`should throw a InvalidReservationLocationError if 'locations' is an empty object`)

  it(`should throw a GraphQL validation error if the 'name' argument is not specified`)

  it(`should throw a GraphQL validation error if the 'startTime' argument is not specified`)

  it(`should throw a GraphQL validation error if the 'endTime' argument is not specified`)

  it(`should use the 'HalfYear' value if no 'timePeriod' argument is specified`)

  it(`should use the 'Weekly' value if no 'recurrence' argument is specified`)

  it('should ')
})

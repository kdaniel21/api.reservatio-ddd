import prisma from '@shared/infra/database/prisma/prisma'
import clearAllData from '@shared/infra/database/prisma/utils/clearAllData'
import {
  InitializedApolloServer,
  initApolloServer,
} from '@shared/infra/http/apollo/initApolloServer'
import supertest from 'supertest'

describe('Login Integration', () => {
  let initializedServer: InitializedApolloServer
  let request: supertest.SuperTest<supertest.Test>

  beforeAll(async () => {
    initializedServer = await initApolloServer()
    request = supertest(initializedServer.serverInfo.url)
  })

  afterAll(async () => {
    await initializedServer.apolloServer.stop()
    await prisma.$disconnect()
  })

  beforeEach(async () => {
    await clearAllData()
  })

  it('should login with the correct credentials and return the user')
  it('should login with the correct credentials and return a valid access token')
  it('should login with the correct credentials, generate and return a valid refresh token')
  it('should throw an InvalidCredentials error if the email address is invalid')
  it('should throw an InvalidCredentials error if the password is invalid')
  it(
    'should throw an EmailAddressNotConfirmedError if the email address has not been confirmed'
  )
})

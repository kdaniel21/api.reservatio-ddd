import { initApolloServer, InitializedApolloServer } from '@shared/infra/http/apollo/initApolloServer'
import supertest from 'supertest'

describe.skip('CreateUser Integration', () => {
  let initializedServer: InitializedApolloServer
  let request: supertest.SuperTest<supertest.Test>

  beforeAll(async () => {
    initializedServer = await initApolloServer()
    request = supertest(initializedServer.serverInfo.url)
  })

  afterAll(async () => {
    await initializedServer.apolloServer.stop()
  })

  it('should create a new user', () => {
    const query = `mutation {
      createUser(params: {
        name: "Foo",
        
      })
    }`
  })
})

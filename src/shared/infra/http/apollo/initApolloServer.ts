import 'reflect-metadata'
import { path } from 'app-root-path'
import { ApolloServer, ServerInfo } from 'apollo-server'
import { buildSchema } from 'type-graphql'
import container from 'typedi'
import config from '@config'
import logger from '@shared/infra/Logger/logger'
import authChecker from './auth/authChecker'
import optionalValidateJwt from './auth/optionalValidateJwt'
import ApolloContext from './types/ApolloContext'
import { ErrorHandlerMiddleware } from './middleware/ErrorHandlerMiddleware'

export interface InitializedApolloServer {
  apolloServer: ApolloServer
  serverInfo: ServerInfo
}

export const initApolloServer = async (): Promise<InitializedApolloServer> => {
  logger.info(`[Apollo] Initializing Apollo GraphQL server...`)

  const srcDir = `${path}/src`
  const schema = await buildSchema({
    resolvers: [
      `${srcDir}/shared/**/HealthCheckResolver.ts`,
      `${srcDir}/modules/**/useCases/**/*Resolver.ts`,
    ],
    globalMiddlewares: [ErrorHandlerMiddleware],
    container,
    authChecker,
  })

  const apolloServer = new ApolloServer({
    schema,
    context: ({ req }): ApolloContext => {
      const jwtPayload = optionalValidateJwt(req)

      return { user: jwtPayload, req }
    },
  })

  const { apolloServerPort: port } = config
  const serverInfo = await apolloServer.listen({ port })
  logger.info(`[Apollo] Server is listening at ${serverInfo.url}`)

  return { serverInfo, apolloServer }
}

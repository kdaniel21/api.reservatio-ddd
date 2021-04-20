import 'reflect-metadata'
import { path } from 'app-root-path'
import { ApolloServer } from 'apollo-server'
import { buildSchema } from 'type-graphql'
import container from 'typedi'
import config from '@config'
import logger from '@shared/infra/Logger/logger'
import authChecker from './auth/authChecker'
import optionalValidateJwt from './auth/optionalValidateJwt'
import ApolloContext from './types/ApolloContext'
import { ErrorHandlerMiddleware } from './middleware/ErrorHandlerMiddleware'

export default async () => {
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

  const server = new ApolloServer({
    schema,
    context: ({ req }): ApolloContext => {
      const jwtPayload = optionalValidateJwt(req)

      return { user: jwtPayload, req }
    },
  })

  const { apolloPort: port } = config
  const info = await server.listen({ port })
  logger.info(`[Apollo] Server is listening at ${info.url}`)
}

import 'reflect-metadata'
import { path } from 'app-root-path'
import { buildSchema } from 'type-graphql'
import container from 'typedi'
import logger from '@shared/infra/Logger/logger'
import authChecker from './auth/authChecker'
import optionalValidateJwt from './auth/optionalValidateJwt'
import ApolloContext from './types/ApolloContext'
import { ErrorHandlerMiddleware } from './middleware/ErrorHandlerMiddleware'
import { BoostedApolloKoaServer, ServerInfo } from './BoostedApolloKoaServer'
import Koa from 'koa'

export interface InitializedApolloServer {
  apolloServer: BoostedApolloKoaServer
  serverInfo: ServerInfo
}

export const initApolloServer = async (): Promise<InitializedApolloServer> => {
  logger.info(`[Apollo] Initializing Apollo GraphQL server...`)

  const srcDir = `${path}/src`
  const schema = await buildSchema({
    resolvers: [
      `${srcDir}/shared/**/HealthCheckResolver.ts`,
      `${srcDir}/modules/**/useCases/**/*Resolver.ts`,
      `${srcDir}/modules/**/GraphQL/**/*Resolver.ts`,
    ],
    globalMiddlewares: [ErrorHandlerMiddleware],
    container,
    authChecker,
  })

  const apolloServer = new BoostedApolloKoaServer({
    schema,
    context: ({ ctx }: { ctx: Koa.Context }): ApolloContext => {
      const { request, cookies } = ctx
      const jwtPayload = optionalValidateJwt(request)

      return { user: jwtPayload, cookies }
    },
  })

  const serverInfo = await apolloServer.listen()

  return { serverInfo, apolloServer }
}

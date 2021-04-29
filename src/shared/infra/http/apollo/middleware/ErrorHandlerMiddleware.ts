import { AppError } from '@shared/core/AppError'
import { isDomainError } from '@shared/core/DomainError'
import logger from '@shared/infra/Logger/logger'
import { ApolloError } from 'apollo-server-koa'
import { MiddlewareFn } from 'type-graphql'

export const ErrorHandlerMiddleware: MiddlewareFn<any> = async (_, next) => {
  try {
    await next()
  } catch (err: any) {
    if (!err) err = new AppError.UnexpectedError()

    if (err instanceof ApolloError) throw err

    if (err && isDomainError(err)) {
      logger.error(err.message)
      throw new ApolloError(err.message, err.code)
    }

    throw err
  }
}

import { isDomainErrorDto } from '@shared/core/DomainError'
import logger from '@shared/infra/Logger/logger'
import { ApolloError } from 'apollo-server'
import { MiddlewareFn } from 'type-graphql'

export const ErrorHandlerMiddleware: MiddlewareFn<any> = async (_, next) => {
  try {
    await next()
  } catch (err: any) {
    if (isDomainErrorDto(err)) {
      logger.error(err.message)
      throw new ApolloError(err.message, err.code)
    }

    throw err
  }
}

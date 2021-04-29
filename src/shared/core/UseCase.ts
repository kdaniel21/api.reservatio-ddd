import logger from '@shared/infra/Logger/logger'
import { AppError } from './AppError'
import { ErrorOr } from './DomainError'
import { Result } from './Result'

export default abstract class UseCase<Request, Response = void> {
  constructor() {}

  protected abstract executeImpl(request: Request): Promise<ErrorOr<Response>> | ErrorOr<Response>

  async execute(request: Request): Promise<ErrorOr<Response>> {
    try {
      const result = await this.executeImpl(request)
      return result
    } catch (err) {
      logger.error('[USE CASE]: Unexpected error!')
      logger.error(err)
      return Result.fail(AppError.UnexpectedError)
    }
  }
}

import logger from '@shared/infra/Logger/logger'
import { AppError } from './AppError'
import { ErrorOr } from './DomainError'
import { Result } from './Result'

export default abstract class UseCase<Request, Response> {
  constructor() {}

  protected abstract executeImpl(
    request: Request
  ): Promise<ErrorOr<Response>> | ErrorOr<Response>

  execute(request: Request): Promise<ErrorOr<Response>> | ErrorOr<Response> {
    try {
      return this.executeImpl(request)
    } catch (err) {
      logger.error('[USE CASE]: Unexpected error!', err)
      return Result.fail(new AppError.UnexpectedError())
    }
  }
}

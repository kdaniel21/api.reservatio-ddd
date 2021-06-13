import logger from '@shared/infra/Logger/logger'
import { AppError } from '../AppError'
import { ErrorOr, isDomainError, isDomainErrorConstructor, PromiseErrorOr } from '../DomainError'
import { Result } from '../Result'

export default abstract class UseCase<Request, Response = void> {
  protected abstract executeImpl(request: Request): PromiseErrorOr<Response> | ErrorOr<Response>

  protected async canExecute(request: Request): Promise<boolean> {
    return true
  }

  async execute(request: Request): Promise<ErrorOr<Response>> {
    try {
      const isAuthorized = this.canExecute(request)
      if (!isAuthorized) return Result.fail(AppError.NotAuthorizedError)

      const result = await this.executeImpl(request)
      return result
    } catch (err) {
      if (isDomainError(err) || isDomainErrorConstructor(err)) return Result.fail(err)

      logger.error('[USE CASE] Unexpected error!')
      logger.error(err)
      return Result.fail(AppError.UnexpectedError)
    }
  }
}

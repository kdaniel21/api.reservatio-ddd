import UserRepository from '@modules/users/repositories/UserRepository/UserRepository'
import { PromiseErrorOr } from '@shared/core/DomainError'
import { Result } from '@shared/core/Result'
import UseCase from '@shared/core/UseCase/UseCase'
import UniqueID from '@shared/domain/UniqueID'
import { GetCurrentUserErrors } from './GetCurrentUserErrors'
import GetCurrentUserUseCaseDto from './types/GetCurrentUserUseCaseDto'
import GetCurrentUserUseCaseResultDto from './types/GetCurrentUserUseCaseResultDto'

export default class GetCurrentUserUseCase extends UseCase<GetCurrentUserUseCaseDto, GetCurrentUserUseCaseResultDto> {
  constructor(private userRepository: UserRepository) {
    super()
  }

  async executeImpl(request: GetCurrentUserUseCaseDto): PromiseErrorOr<GetCurrentUserUseCaseResultDto> {
    const userId = new UniqueID(request.userId)
    const userOrError = await this.userRepository.findById(userId)
    if (userOrError.isFailure())
      return Result.fail(userOrError.error || new GetCurrentUserErrors.UserNotFoundError(userId))

    const user = userOrError.value
    return Result.ok({ user })
  }
}

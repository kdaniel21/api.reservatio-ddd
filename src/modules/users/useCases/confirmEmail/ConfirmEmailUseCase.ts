import { PrismaUser } from '.prisma/client'
import UserRepository from '@modules/users/repositories/UserRepository/UserRepository'
import { PromiseErrorOr } from '@shared/core/DomainError'
import { Result } from '@shared/core/Result'
import UseCase from '@shared/core/UseCase'
import TextUtils from '@shared/utils/TextUtils'
import { ConfirmEmailErrors } from './ConfirmEmailErrors'
import ConfirmEmailUseCaseDto from './DTOs/ConfirmEmailUseCaseDto'

export default class ConfirmEmailUseCase extends UseCase<ConfirmEmailUseCaseDto> {
  constructor(private userRepo: UserRepository<PrismaUser>) {
    super()
  }

  async executeImpl(request: ConfirmEmailUseCaseDto): PromiseErrorOr {
    const hashedToken = TextUtils.hashText(request.emailConfirmationToken)

    const userOrError = await this.userRepo.findOne({ emailConfirmationToken: hashedToken })
    if (userOrError.isFailure()) return Result.fail(ConfirmEmailErrors.InvalidEmailConfirmationToken)

    const user = userOrError.value
    user.confirmEmail()

    return this.userRepo.save(user)
  }
}

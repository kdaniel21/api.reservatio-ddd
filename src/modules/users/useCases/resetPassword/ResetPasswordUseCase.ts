import UserPasswordResetToken from '@modules/users/domain/UserPasswordResetToken'
import UserRepository from '@modules/users/repositories/UserRepository'
import { ErrorOr } from '@shared/core/DomainError'
import { Result } from '@shared/core/Result'
import UseCase from '@shared/core/UseCase'
import ResetPasswordUseCaseDto from './DTOs/ResetPasswordUseCaseDto'
import { ResetPasswordErrors } from './ResetPasswordErrors'

export default class ResetPasswordUseCase extends UseCase<ResetPasswordUseCaseDto, UserPasswordResetToken> {
  constructor(private userRepo: UserRepository) {
    super()
  }

  async executeImpl(request: ResetPasswordUseCaseDto): Promise<ErrorOr<UserPasswordResetToken>> {
    const userOrError = await this.userRepo.findByEmail(request.email)
    if (userOrError.isFailure()) return Result.fail(userOrError.error || ResetPasswordErrors.NonExistentEmailAddress)

    const user = userOrError.value
    const passwordResetTokenOrError = user.generatePasswordResetToken()
    if (passwordResetTokenOrError.isFailure()) return Result.fail(passwordResetTokenOrError.error)

    const saveResult = await this.userRepo.save(user)
    if (saveResult.isFailure()) return Result.fail(saveResult.error)

    return Result.ok(passwordResetTokenOrError.value)
  }
}

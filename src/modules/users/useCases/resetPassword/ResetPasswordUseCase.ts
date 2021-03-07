import UserPasswordResetToken from '@modules/users/domain/UserPasswordResetToken'
import UserRepository from '@modules/users/repositories/UserRepository'
import { ErrorOr } from '@shared/core/DomainError'
import { Result } from '@shared/core/Result'
import UseCase from '@shared/core/UseCase'
import ResetPasswordDto from './DTOs/ResetPasswordDto'
import { ResetPasswordErrors } from './ResetPasswordErrors'

export default class ResetPasswordUseCase extends UseCase<
  ResetPasswordDto,
  UserPasswordResetToken
> {
  constructor(private userRepo: UserRepository) {
    super()
  }

  async executeImpl(request: ResetPasswordDto): Promise<ErrorOr<UserPasswordResetToken>> {
    const user = await this.userRepo.findByEmail(request.email)
    if (!user) return Result.fail(new ResetPasswordErrors.NonExistentEmailAddress())

    const passwordResetTokenOrError = user.generatePasswordResetToken()
    if (passwordResetTokenOrError.isFailure())
      return Result.fail(passwordResetTokenOrError.error)

    await this.userRepo.save(user)

    return Result.ok()
  }
}

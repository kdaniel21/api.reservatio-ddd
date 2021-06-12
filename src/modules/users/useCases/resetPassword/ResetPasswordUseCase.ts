import UserPasswordResetToken from '@modules/users/domain/UserPasswordResetToken'
import UserRepository from '@modules/users/repositories/UserRepository/UserRepository'
import { PromiseErrorOr } from '@shared/core/DomainError'
import { Result } from '@shared/core/Result'
import UseCase from '@shared/core/UseCase'
import { LoginErrors } from '../login/LoginErrors'
import ResetPasswordUseCaseDto from './DTOs/ResetPasswordUseCaseDto'

export default class ResetPasswordUseCase extends UseCase<ResetPasswordUseCaseDto, UserPasswordResetToken> {
  constructor(private userRepo: UserRepository) {
    super()
  }

  async executeImpl(request: ResetPasswordUseCaseDto): PromiseErrorOr<UserPasswordResetToken> {
    const userOrError = await this.userRepo.findByEmail(request.email)
    if (userOrError.isFailure()) return Result.fail(userOrError.error)

    const user = userOrError.value
    if (!user.isEmailConfirmed) return Result.fail(LoginErrors.EmailAddressNotConfirmedError)

    const passwordResetTokenOrError = user.generatePasswordResetToken()
    if (passwordResetTokenOrError.isFailure()) return Result.fail(passwordResetTokenOrError.error)

    const saveResult = await this.userRepo.save(user)
    if (saveResult.isFailure()) return Result.fail(saveResult.error)

    return Result.ok(passwordResetTokenOrError.value)
  }
}

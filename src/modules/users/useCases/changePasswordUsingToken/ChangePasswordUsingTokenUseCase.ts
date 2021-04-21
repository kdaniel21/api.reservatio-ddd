import UserRepository from '@modules/users/repositories/UserRepository'
import { PrismaUser } from '@prisma/client'
import { ErrorOr } from '@shared/core/DomainError'
import { Result } from '@shared/core/Result'
import UseCase from '@shared/core/UseCase'
import TextUtils from '@shared/utils/TextUtils'
import { ChangePasswordUsingTokenErrors } from './ChangePasswordUsingTokenErrors'
import ChangePasswordUsingTokenUseCaseDto from './DTOs/ChangePasswordUsingTokenUseCaseDto'

export default class ChangePasswordUsingTokenUseCase extends UseCase<
  ChangePasswordUsingTokenUseCaseDto,
  void
> {
  constructor(private userRepo: UserRepository<PrismaUser>) {
    super()
  }

  async executeImpl(request: ChangePasswordUsingTokenUseCaseDto): Promise<ErrorOr<void>> {
    const token = request.passwordResetToken
    const hashedToken = TextUtils.hashText(token)

    const user = await this.userRepo.findOne({ passwordResetToken: hashedToken })
    if (!user) return Result.fail(ChangePasswordUsingTokenErrors.InvalidTokenError)

    const isTokenValid = user.passwordResetToken.isTokenValid(token)
    if (!isTokenValid) return Result.fail(ChangePasswordUsingTokenErrors.InvalidTokenError)

    const result = user.setPassword(request.newPassword)
    if (result.isFailure()) return Result.fail(result.error)

    user.destroyPasswordResetToken()

    console.log('save', user.passwordResetToken)
    await this.userRepo.save(user)

    return Result.ok()
  }
}

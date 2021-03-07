import UserRepository from '@modules/users/repositories/UserRepository'
import { PrismaUser } from '@prisma/client'
import { ErrorOr } from '@shared/core/DomainError'
import { Result } from '@shared/core/Result'
import UseCase from '@shared/core/UseCase'
import TextUtils from '@shared/utils/TextUtils'
import { ChangePasswordUsingTokenErrors } from './ChangePasswordUsingTokenErrors'
import ChangePasswordUsingTokenDto from './DTOs/ChangePasswordUsingTokenDto'

export default class ChangePasswordUsingTokenUseCase extends UseCase<
  ChangePasswordUsingTokenDto,
  void
> {
  constructor(private userRepo: UserRepository<PrismaUser>) {
    super()
  }

  async executeImpl(request: ChangePasswordUsingTokenDto): Promise<ErrorOr<void>> {
    const token = request.passwordResetToken
    const hashedToken = TextUtils.hashText(token)

    const user = await this.userRepo.findOne({ passwordResetToken: hashedToken })
    if (!user) return Result.fail(new ChangePasswordUsingTokenErrors.InvalidTokenError())

    const isTokenValid = user.passwordResetToken.isTokenValid(token)
    if (!isTokenValid)
      return Result.fail(new ChangePasswordUsingTokenErrors.InvalidTokenError())

    const result = user.setPassword(request.newPassword)
    if (result.isFailure()) return Result.fail(result.error)

    await this.userRepo.save(user)

    return Result.ok()
  }
}

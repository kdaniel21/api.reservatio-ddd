import UserRepository from '@modules/users/repositories/UserRepository/UserRepository'
import { PromiseErrorOr } from '@shared/core/DomainError'
import { Result } from '@shared/core/Result'
import UseCase from '@shared/core/UseCase'
import MailerService from '@shared/services/MailerService/MailerService'
import { ConfirmEmailTemplate } from '@shared/services/MailerService/templates/ConfirmEmailTemplate'
import SendEmailConfirmationUseCaseDto from './DTOs/SendEmailConfirmationUseCaseDto'
import { SendEmailConfirmationErrors } from './SendEmailConfirmationErrors'

export default class SendEmailConfirmationUseCase extends UseCase<SendEmailConfirmationUseCaseDto> {
  constructor(private userRepo: UserRepository, private mailerService: MailerService) {
    super()
  }

  async executeImpl(request: SendEmailConfirmationUseCaseDto): PromiseErrorOr {
    const userOrError = await this.userRepo.findByEmail(request.email)
    if (userOrError.isFailure())
      return Result.fail(userOrError.error || SendEmailConfirmationErrors.EmailAlreadyConfirmed)

    const user = userOrError.value

    if (user.isEmailConfirmed) return Result.fail(SendEmailConfirmationErrors.EmailAlreadyConfirmed)

    const emailConfirmationTokenOrError = user.generateEmailConfirmationToken()
    if (emailConfirmationTokenOrError.isFailure()) return Result.fail(emailConfirmationTokenOrError.error)

    const { EmailTemplate = ConfirmEmailTemplate, name } = request
    const sendMailResult = await this.mailerService.sendToUser(EmailTemplate, user, { user, name })
    if (sendMailResult.isFailure()) return Result.fail(sendMailResult.error)

    return this.userRepo.save(user)
  }
}

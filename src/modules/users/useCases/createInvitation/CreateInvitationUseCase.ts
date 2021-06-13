import CustomerRole from '@modules/reservation/domain/CustomerRole'
import CustomerRepository from '@modules/reservation/repositories/CustomerRepository/CustomerRepository'
import { Invitation } from '@modules/users/domain/Invitation'
import UserEmail from '@modules/users/domain/UserEmail'
import InvitationRepository from '@modules/users/repositories/InvitationRepository/InvitationRepository'
import UserRepository from '@modules/users/repositories/UserRepository/UserRepository'
import { AppError } from '@shared/core/AppError'
import { PromiseErrorOr } from '@shared/core/DomainError'
import { Result } from '@shared/core/Result'
import UseCase from '@shared/core/UseCase/UseCase'
import UniqueID from '@shared/domain/UniqueID'
import MailerService from '@shared/services/MailerService/MailerService'
import { InvitationTemplate } from '@shared/services/MailerService/templates/InvitationTemplate'
import { CreateInvitationErrors } from './CreateInvitationErrors'
import CreateInvitationUseCaseDto from './DTOs/CreateInvitationUseCaseDto'

export default class CreateInvitationUseCase extends UseCase<CreateInvitationUseCaseDto> {
  // TODO: Find a way to decouple this from the customer role
  constructor(
    private readonly customerRepo: CustomerRepository,
    private readonly invitationRepo: InvitationRepository,
    private readonly userRepo: UserRepository,
    private readonly mailerService: MailerService,
  ) {
    super()
  }

  async executeImpl(request: CreateInvitationUseCaseDto): PromiseErrorOr {
    const userId = new UniqueID(request.redactedUser.userId)
    const customerOrError = await this.customerRepo.findByUserId(userId, { user: true })
    if (customerOrError.isFailure()) return Result.fail(customerOrError.error)

    const customer = customerOrError.value
    const isAdmin = customer.role === CustomerRole.Admin
    if (!isAdmin) return Result.fail(AppError.NotAuthorizedError)

    const emailAddressOrError = UserEmail.create(request.emailAddress)
    if (emailAddressOrError.isFailure()) return Result.fail(emailAddressOrError.error)

    const emailAddress = emailAddressOrError.value

    const isEmailAlreadyRegisteredOrError = await this.userRepo.existsByEmail(emailAddress.value)
    if (isEmailAlreadyRegisteredOrError.isFailure()) return Result.fail(isEmailAlreadyRegisteredOrError.error)

    const isEmailAlreadyRegistered = isEmailAlreadyRegisteredOrError.value
    if (isEmailAlreadyRegistered) return Result.fail(CreateInvitationErrors.EmailAlreadyRegisteredError)

    const userOrError = await this.userRepo.findById(userId)
    const invitationOrError = Invitation.create({ emailAddress, inviter: userOrError.value })
    if (invitationOrError.isFailure()) return Result.fail(invitationOrError.error)

    const invitation = invitationOrError.value
    const saveResult = await this.invitationRepo.save(invitation)

    // TODO: Re-schedule if failed
    const sendMailResult = await this.mailerService.sendToAddress(InvitationTemplate, invitation.emailAddress.value, {
      invitation,
    })

    const combinedResult = Result.combine([saveResult, sendMailResult])
    if (combinedResult.isFailure()) return Result.fail(combinedResult.error)

    return Result.ok()
  }
}

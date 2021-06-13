import { JwtPayload, JwtToken } from '@modules/users/domain/AccessToken'
import UserEmail from '@modules/users/domain/UserEmail'
import InvitationRepository from '@modules/users/repositories/InvitationRepository/InvitationRepository'
import AuthService from '@modules/users/services/AuthService/AuthService'
import { PromiseErrorOr } from '@shared/core/DomainError'
import { Result } from '@shared/core/Result'
import UseCase from '@shared/core/UseCase'
import CreateUserUseCase from '../createUser/CreateUserUseCase'
import RegisterUseCaseDto from './DTOs/RegisterUseCaseDto'
import RegisterUseCaseResultDto from './DTOs/RegisterUseCaseResultDto'
import { RegisterErrors } from './RegisterErrors'

export default class RegisterUseCase extends UseCase<RegisterUseCaseDto, RegisterUseCaseResultDto> {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly authService: AuthService<JwtToken, JwtPayload>,
    private readonly invitationRepo: InvitationRepository,
  ) {
    super()
  }

  protected async executeImpl(request: RegisterUseCaseDto): PromiseErrorOr<RegisterUseCaseResultDto> {
    const invitationOrError = await this.invitationRepo.findByToken(request.invitationToken)
    if (invitationOrError.isFailure())
      return Result.fail(invitationOrError.error || RegisterErrors.InvalidInvitationError)

    const emailAddressOrError = UserEmail.create(request.email)
    if (emailAddressOrError.isFailure()) return Result.fail(emailAddressOrError.error)

    const invitation = invitationOrError.value
    const isInvitationValid = invitation.isValid
    const doEmailAddressesMatch = invitation.emailAddress.equals(emailAddressOrError.value)
    if (!isInvitationValid || !doEmailAddressesMatch) return Result.fail(RegisterErrors.InvalidInvitationError)

    const newUserOrError = await this.createUserUseCase.execute(request)
    if (newUserOrError.isFailure()) return Result.fail(newUserOrError.error)

    const newUser = newUserOrError.value.user

    invitation.deactivate()
    const saveResult = await this.invitationRepo.save(invitation)
    if (saveResult.isFailure()) return Result.fail(saveResult.error)

    const refreshTokenOrError = await this.authService.createRefreshToken(newUser)
    if (refreshTokenOrError.isFailure()) return Result.fail(refreshTokenOrError.error)

    const refreshToken = refreshTokenOrError.value
    const accessToken = this.authService.createAccessToken(newUser)

    return Result.ok({
      accessToken,
      refreshToken,
      user: newUser,
    })
  }
}

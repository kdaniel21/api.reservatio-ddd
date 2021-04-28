import UseCase from '@shared/core/UseCase'
import { Result } from '@shared/core/Result'
import { ErrorOr, PromiseErrorOr } from '@shared/core/DomainError'
import User from '@modules/users/domain/User'
import UserEmail from '@modules/users/domain/UserEmail'
import UserName from '@modules/users/domain/UserName'
import UserPassword from '@modules/users/domain/UserPassword'
import UserRepository from '@modules/users/repositories/UserRepository'
import CreateUserUseCaseDto from './DTOs/CreateUserUseCaseDto'
import { CreateUserError } from './CreateUserErrors'
import CreateUserUseCaseResultDto from './DTOs/CreateUserUseCaseResultDto'
import UserEmailConfirmationToken from '@modules/users/domain/UserEmailConfirmationToken'

export default class CreateUserUseCase extends UseCase<CreateUserUseCaseDto, CreateUserUseCaseResultDto> {
  constructor(private userRepo: UserRepository) {
    super()
  }

  protected async executeImpl(request: CreateUserUseCaseDto): PromiseErrorOr<CreateUserUseCaseResultDto> {
    const emailOrError = UserEmail.create(request.email)
    const nameOrError = UserName.create(request.name)
    const passwordOrError = UserPassword.create({ password: request.password })
    const emailConfirmationTokenOrError = UserEmailConfirmationToken.create()

    const dtoResult = Result.combine([emailOrError, nameOrError, passwordOrError, emailConfirmationTokenOrError])
    if (dtoResult.isFailure()) return Result.fail(dtoResult.error)

    const email = emailOrError.value
    const name = nameOrError.value
    const password = passwordOrError.value
    const emailConfirmationToken = emailConfirmationTokenOrError.value

    const isEmailAlreadyRegisteredOrError = await this.userRepo.existsByEmail(email.value)
    if (isEmailAlreadyRegisteredOrError.isFailure()) return Result.fail(isEmailAlreadyRegisteredOrError.error)

    const isEmailAlreadyRegistered = isEmailAlreadyRegisteredOrError.value
    if (isEmailAlreadyRegistered) return Result.fail(new CreateUserError.EmailAlreadyExistsError(email.value))

    const createdUserOrError = User.create({ email, name, password, emailConfirmationToken })
    if (createdUserOrError.isFailure()) return Result.fail(createdUserOrError.error)

    const createdUser = createdUserOrError.value
    const saveResult = await this.userRepo.save(createdUser)

    return saveResult.isSuccess() ? Result.ok({ user: createdUser }) : Result.fail(saveResult.error)
  }
}

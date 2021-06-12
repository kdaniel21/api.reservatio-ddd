import UseCase from '@shared/core/UseCase'
import { Result } from '@shared/core/Result'
import { PromiseErrorOr } from '@shared/core/DomainError'
import User from '@modules/users/domain/User'
import UserEmail from '@modules/users/domain/UserEmail'
import UserPassword from '@modules/users/domain/UserPassword'
import CreateUserUseCaseDto from './DTOs/CreateUserUseCaseDto'
import { CreateUserError } from './CreateUserErrors'
import CreateUserUseCaseResultDto from './DTOs/CreateUserUseCaseResultDto'
import CustomerName from '@modules/reservation/domain/CustomerName'
import UserRepository from '@modules/users/repositories/UserRepository/UserRepository'

export default class CreateUserUseCase extends UseCase<CreateUserUseCaseDto, CreateUserUseCaseResultDto> {
  constructor(private userRepo: UserRepository) {
    super()
  }

  protected async executeImpl(request: CreateUserUseCaseDto): PromiseErrorOr<CreateUserUseCaseResultDto> {
    const emailOrError = UserEmail.create(request.email)
    const passwordOrError = UserPassword.create({ password: request.password })
    const customerNameOrError = CustomerName.create(request.name)

    const dtoResult = Result.combine([emailOrError, passwordOrError, customerNameOrError])
    if (dtoResult.isFailure()) return Result.fail(dtoResult.error)

    const email = emailOrError.value
    const password = passwordOrError.value
    const name = customerNameOrError.value

    const isEmailAlreadyRegisteredOrError = await this.userRepo.existsByEmail(email.value)
    if (isEmailAlreadyRegisteredOrError.isFailure()) return Result.fail(isEmailAlreadyRegisteredOrError.error)

    const isEmailAlreadyRegistered = isEmailAlreadyRegisteredOrError.value
    if (isEmailAlreadyRegistered) return Result.fail(new CreateUserError.EmailAlreadyExistsError(email.value))

    const createdUserOrError = User.create({ email, password, name })
    if (createdUserOrError.isFailure()) return Result.fail(createdUserOrError.error)

    const createdUser = createdUserOrError.value
    createdUser.generateEmailConfirmationToken()

    const saveResult = await this.userRepo.save(createdUser)
    return saveResult.isSuccess() ? Result.ok({ user: createdUser }) : Result.fail(saveResult.error)
  }
}

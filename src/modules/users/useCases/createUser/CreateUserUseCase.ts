import UseCase from '@shared/core/UseCase'
import { Result } from '@shared/core/Result'
import { ErrorOr } from '@shared/core/DomainError'
import User from '@modules/users/domain/User'
import UserEmail from '@modules/users/domain/UserEmail'
import UserName from '@modules/users/domain/UserName'
import UserPassword from '@modules/users/domain/UserPassword'
import UserRepository from '@modules/users/repositories/UserRepository'
import CreateUserUseCaseDto from './DTOs/CreateUserUseCaseDto'
import { CreateUserError } from './CreateUserErrors'
import CreateUserUseCaseResultDto from './DTOs/CreateUserUseCaseResultDto'

export default class CreateUserUseCase extends UseCase<CreateUserUseCaseDto, CreateUserUseCaseResultDto> {
  constructor(private userRepo: UserRepository) {
    super()
  }

  protected async executeImpl(
    request: CreateUserUseCaseDto
  ): Promise<ErrorOr<CreateUserUseCaseResultDto>> {
    const emailOrError = UserEmail.create(request.email)
    const nameOrError = UserName.create(request.name)
    const passwordOrError = UserPassword.create({ password: request.password })

    const dtoResult = Result.combine([emailOrError, nameOrError, passwordOrError])
    if (dtoResult.isFailure()) return Result.fail(dtoResult.error)

    const email = emailOrError.value
    const name = nameOrError.value
    const password = passwordOrError.value

    const isEmailAlreadyRegistered = await this.userRepo.existsByEmail(email.value)
    if (isEmailAlreadyRegistered)
      return Result.fail(new CreateUserError.EmailAlreadyExistsError(email.value))

    const createdUserOrError = User.create({ email, name, password })
    if (createdUserOrError.isFailure()) return Result.fail(createdUserOrError.error)

    const createdUser = createdUserOrError.value
    await this.userRepo.save(createdUser)

    return Result.ok({ user: createdUser })
  }
}

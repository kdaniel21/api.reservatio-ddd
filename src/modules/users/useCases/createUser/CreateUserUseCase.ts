import User from '@modules/users/domain/User'
import UserEmail from '@modules/users/domain/UserEmail'
import UserName from '@modules/users/domain/UserName'
import UserPassword from '@modules/users/domain/UserPassword'
import UserDto from '@modules/users/DTOs/UserDto'
import UserMapper from '@modules/users/mappers/UserMapper'
import UserRepository from '@modules/users/repositories/UserRepository'
import { AppError } from '@shared/core/AppError'
import { ErrorOr } from '@shared/core/DomainError'
import { Result } from '@shared/core/Result'
import UseCase from '@shared/core/UseCase'
import CreateUserDto from './CreateUserDto'
import { CreateUserError } from './CreateUserErrors'

export default class CreateUserUseCase implements UseCase<CreateUserDto, ErrorOr<UserDto>> {
  constructor(private userRepo: UserRepository) {}

  async execute(request: CreateUserDto): Promise<ErrorOr<UserDto>> {
    const emailOrError = UserEmail.create(request.email)
    const nameOrError = UserName.create(request.name)
    const passwordOrError = UserPassword.create({ password: request.password })

    const dtoResult = Result.combine([emailOrError, nameOrError, passwordOrError])
    if (dtoResult.isFailure()) return Result.fail(dtoResult.error)

    const email = emailOrError.value
    const name = nameOrError.value
    const password = passwordOrError.value

    try {
      const isEmailAlreadyRegistered = await this.userRepo.existsByEmail(email.value)
      if (isEmailAlreadyRegistered)
        return Result.fail(new CreateUserError.EmailAlreadyExistsError(email.value))

      const createdUserOrError = User.create({ email, name, password })
      if (createdUserOrError.isFailure()) return Result.fail(createdUserOrError.error)

      const createdUser = createdUserOrError.value
      await this.userRepo.save(createdUser)

      const userDto = UserMapper.toDto(createdUser)
      return Result.ok(userDto)
    } catch (err) {
      return Result.fail(new AppError.UnexpectedError())
    }
  }
}

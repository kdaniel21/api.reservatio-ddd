import { mocked } from 'ts-jest/utils'
import UserRepository from '@modules/users/repositories/UserRepository'
import { AppError } from '@shared/core/AppError'
import CreateUserUseCaseDto from './DTOs/CreateUserUseCaseDto'
import CreateUserUseCase from './CreateUserUseCase'
import { CreateUserError } from './CreateUserErrors'
import UserRole from '@modules/users/domain/UserRole'
import InvalidUserEmailError from '@modules/users/domain/errors/InvalidUserEmailError'
import InvalidUserNameError from '@modules/users/domain/errors/InvalidUserNameError'
import { InvalidUserPasswordError } from '@modules/users/domain/errors/InvalidUserPasswordError'
import User from '@modules/users/domain/User'
import { Result } from '@shared/core/Result'

describe('CreateUserUseCase', () => {
  let useCase: CreateUserUseCase
  let userRepo: Partial<UserRepository>

  beforeEach(() => {
    userRepo = {
      existsByEmail: jest.fn(),
      save: jest.fn().mockReturnValue(Result.ok()),
    }
    useCase = new CreateUserUseCase(userRepo as UserRepository)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should create a new user', async () => {
    const request: CreateUserUseCaseDto = {
      email: 'foo@bar.com',
      name: 'Foo Bar',
      password: 'Th1sIsAG00dP4ssw0rd',
    }
    mocked(userRepo).existsByEmail.mockResolvedValueOnce(Result.ok(false))

    const result = await useCase.execute(request)

    expect(result.isSuccess()).toBe(true)
    expect(result.isFailure()).toBe(false)
    expect(result.value.user.email.value).toBe(request.email)
    expect(result.value.user.name.value).toBe(request.name)
    expect(result.value.user.role).toBe(UserRole.User)
    expect(result.value.user.isDeleted).toBe(false)
    expect(result.value.user.isEmailConfirmed).toBe(false)
    expect(userRepo.save).toBeCalled()
  })

  it('should emit a UserCreatedEvent', async () => {
    const request: CreateUserUseCaseDto = {
      email: 'foo@bar.com',
      name: 'Foo Bar',
      password: 'Th1sIsAG00dP4ssw0rd',
    }
    mocked(userRepo).existsByEmail.mockResolvedValueOnce(Result.ok(false))
    jest.spyOn(User.prototype as any, 'addDomainEvent')

    const result = await useCase.execute(request)

    const user: any = result.value.user
    expect(user.addDomainEvent).toHaveBeenCalledTimes(1)
  })

  it('should fail to create a new user when using an invalid email address', async () => {
    const request: CreateUserUseCaseDto = {
      email: 'foo',
      name: 'Foo Bar',
      password: 'Th1sIsAG00dP4ssw0rd',
    }

    const result = await useCase.execute(request)

    expect(result.isSuccess()).toBe(false)
    expect(result.isFailure()).toBe(true)
    expect(result.error).toBeInstanceOf(InvalidUserEmailError)
    expect(userRepo.save).toBeCalledTimes(0)
    expect(userRepo.existsByEmail).toBeCalledTimes(0)
  })

  it('should fail to create a new user when using an invalid name', async () => {
    const request: CreateUserUseCaseDto = {
      email: 'foo@bar.com',
      name: 'foo',
      password: 'Th1sIsAG00dP4ssw0rd',
    }

    const result = await useCase.execute(request)

    expect(result.isSuccess()).toBe(false)
    expect(result.isFailure()).toBe(true)
    expect(result.error).toBeInstanceOf(InvalidUserNameError)
    expect(userRepo.save).not.toBeCalled()
    expect(userRepo.existsByEmail).not.toBeCalled()
  })

  it('should fail to create a new user when using an invalid password', async () => {
    const request: CreateUserUseCaseDto = {
      email: 'foo@bar.com',
      name: 'Foo Bar',
      password: 'password',
    }

    const result = await useCase.execute(request)

    expect(result.isSuccess()).toBe(false)
    expect(result.isFailure()).toBe(true)
    expect(result.error).toBeInstanceOf(InvalidUserPasswordError)
    expect(userRepo.save).not.toBeCalled()
    expect(userRepo.existsByEmail).not.toBeCalled()
  })

  it('should throw EmailAlreadyExistsError when using an already registered email address', async () => {
    const request: CreateUserUseCaseDto = {
      email: 'foo@bar.com',
      name: 'Foo Bar',
      password: 'Th1sIsAG00dP4ssw0rd',
    }
    mocked(userRepo).existsByEmail.mockResolvedValueOnce(Result.ok(true))

    const result = await useCase.execute(request)

    expect(result.isSuccess()).toBe(false)
    expect(result.isFailure()).toBe(true)
    expect(result.error).toBeInstanceOf(CreateUserError.EmailAlreadyExistsError)
    expect(userRepo.save).not.toBeCalled()
  })

  it('should throw UnexpectedError if userRepo.save() fails', async () => {
    const request: CreateUserUseCaseDto = {
      email: 'foo@bar.com',
      name: 'Foo Bar',
      password: 'Th1sIsAG00dP4ssw0rd',
    }
    mocked(userRepo).existsByEmail.mockResolvedValueOnce(Result.ok(false))
    mocked(userRepo).save.mockRejectedValueOnce('error')

    const result = await useCase.execute(request)

    expect(result.isSuccess()).toBe(false)
    expect(result.isFailure()).toBe(true)
    expect(result.error).toBeInstanceOf(AppError.UnexpectedError)
  })
})

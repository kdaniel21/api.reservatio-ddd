import { mocked } from 'ts-jest/utils'
import faker from 'faker'
import UserRepository from '@modules/users/repositories/UserRepository'
import CreateUserDto from './CreateUserDto'
import CreateUserUseCase from './CreateUserUseCase'
import { CreateUserError } from './CreateUserErrors'
import { AppError } from '@shared/core/AppError'

describe('CreateUserUseCase', () => {
  let useCase: CreateUserUseCase
  let userRepo: Partial<UserRepository>

  beforeEach(() => {
    userRepo = {
      existsByEmail: jest.fn(),
      save: jest.fn(),
    }
    useCase = new CreateUserUseCase(userRepo as UserRepository)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should create a new user', async () => {
    const request: CreateUserDto = {
      email: faker.internet.email().toLowerCase(),
      name: faker.name.findName(),
      password: 'Th1sIsAG00dP4ssw0rd',
    }
    mocked(userRepo).existsByEmail.mockResolvedValueOnce(false)

    const result = await useCase.execute(request)

    expect(result.isSuccess()).toBe(true)
    expect(result.isFailure()).toBe(false)
    expect(result.value.email).toBe(request.email)
    expect(result.value.name).toBe(request.name)
    expect(result.value.isAdmin).toBe(false)
    expect(result.value.isDeleted).toBe(false)
    expect(result.value.isEmailConfirmed).toBe(false)
    expect(userRepo.save).toBeCalled()
  })

  it('should fail to create a new user when using an invalid email address', async () => {
    const request: CreateUserDto = {
      email: faker.internet.userName(),
      name: faker.name.findName(),
      password: 'Th1sIsAG00dP4ssw0rd',
    }

    const result = await useCase.execute(request)

    expect(result.isSuccess()).toBe(false)
    expect(result.isFailure()).toBe(true)
    expect(userRepo.save).not.toBeCalled()
    expect(userRepo.existsByEmail).not.toBeCalled()
  })

  it('should throw EmailAlreadyExistsError when using an already registered email address', async () => {
    const request: CreateUserDto = {
      email: faker.internet.email().toLowerCase(),
      name: faker.name.findName(),
      password: 'Th1sIsAG00dP4ssw0rd',
    }
    mocked(userRepo).existsByEmail.mockResolvedValueOnce(true)

    const result = await useCase.execute(request)

    expect(result.isSuccess()).toBe(false)
    expect(result.isFailure()).toBe(true)
    expect(result.error).toBeInstanceOf(CreateUserError.EmailAlreadyExistsError)
    expect(userRepo.save).not.toBeCalled()
  })

  it('should throw UnexpectedError if userRepo.save() fails', async () => {
    const request: CreateUserDto = {
      email: faker.internet.email().toLowerCase(),
      name: faker.name.findName(),
      password: 'Th1sIsAG00dP4ssw0rd',
    }
    mocked(userRepo).existsByEmail.mockResolvedValueOnce(false)
    mocked(userRepo).save.mockRejectedValueOnce('error')

    const result = await useCase.execute(request)

    expect(result.isSuccess()).toBe(false)
    expect(result.isFailure()).toBe(true)
    expect(result.error).toBeInstanceOf(AppError.UnexpectedError)
  })

  it('should not allow to create a user with isAdmin: true', async () => {
    const request = {
      email: faker.internet.email().toLowerCase(),
      name: faker.name.findName(),
      password: 'Th1sIsAG00dP4ssw0rd',
      isAdmin: true,
    } as CreateUserDto
    mocked(userRepo).existsByEmail.mockResolvedValueOnce(false)

    const result = await useCase.execute(request)

    expect(result.isSuccess()).toBe(true)
    expect(result.isFailure()).toBe(false)
    expect(result.value.email).toBe(request.email)
    expect(result.value.name).toBe(request.name)
    expect(result.value.isAdmin).toBe(false)
    expect(result.value.isDeleted).toBe(false)
    expect(result.value.isEmailConfirmed).toBe(false)
    expect(userRepo.save).toBeCalled()
  })
})

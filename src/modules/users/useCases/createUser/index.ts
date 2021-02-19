import { userRepository } from '@modules/users/repositories'
import CreateUserController from './CreateUserController'
import CreateUserUseCase from './CreateUserUseCase'

export const createUserUseCase = new CreateUserUseCase(userRepository)

export const createUserController = new CreateUserController(createUserUseCase)

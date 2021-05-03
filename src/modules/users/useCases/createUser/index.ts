import { userRepository } from '@modules/users/repositories'
import CreateUserUseCase from './CreateUserUseCase'

export const createUserUseCase = new CreateUserUseCase(userRepository)

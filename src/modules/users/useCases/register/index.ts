import { authService } from '@modules/users/services'
import { createUserUseCase } from '../createUser'
import RegisterController from './RegisterController'
import RegisterUseCase from './RegisterUseCase'

export const registerUseCase = new RegisterUseCase(createUserUseCase, authService)

export const registerController = new RegisterController(registerUseCase)

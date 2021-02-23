import { userRepository } from '@modules/users/repositories'
import LoginUseCase from './LoginUseCase'
import LoginController from './LoginController'

export const loginUseCase = new LoginUseCase(userRepository)

export const loginController = new LoginController(loginUseCase)

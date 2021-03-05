import { userRepository } from '@modules/users/repositories'
import { authService } from '@modules/users/services'
import LogoutController from './LogoutController'
import LogoutUseCase from './LogoutUseCase'

export const logoutUseCase = new LogoutUseCase(userRepository, authService)

export const logoutController = new LogoutController(logoutUseCase)

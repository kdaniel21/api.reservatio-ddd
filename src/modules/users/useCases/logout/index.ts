import { userRepository } from '@modules/users/repositories'
import { authService } from '@modules/users/services'
import LogoutResolver from './LogoutResolver'
import LogoutUseCase from './LogoutUseCase'

export const logoutUseCase = new LogoutUseCase(userRepository, authService)

export const logoutResolver = new LogoutResolver(logoutUseCase)

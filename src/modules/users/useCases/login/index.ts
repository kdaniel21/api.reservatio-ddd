import { userRepository } from '@modules/users/repositories'
import LoginUseCase from './LoginUseCase'
import { authService } from '@modules/users/services'
import LoginResolver from './LoginResolver'

export const loginUseCase = new LoginUseCase(userRepository, authService)

export const loginResolver = new LoginResolver(loginUseCase)

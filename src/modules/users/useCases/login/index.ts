import { userRepository } from '@modules/users/repositories'
import { authService } from '@modules/users/services'
import LoginUseCase from './LoginUseCase'
import LoginResolver from './LoginResolver'

export const loginUseCase = new LoginUseCase(userRepository, authService)

export const loginResolver = new LoginResolver(loginUseCase)

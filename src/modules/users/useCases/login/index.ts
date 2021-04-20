import { userRepository } from '@modules/users/repositories'
import LoginUseCase from './LoginUseCase'
import { authService } from '@modules/users/services'
import LoginResolver from './LoginResolver'
import Container from 'typedi'

export const loginUseCase = new LoginUseCase(userRepository, authService)

export const loginResolver = new LoginResolver(loginUseCase)

Container.set(LoginResolver, loginResolver)

import { authService } from '@modules/users/services'
import { createUserUseCase } from '../createUser'
import RegisterResolver from './RegisterResolver'
import RegisterUseCase from './RegisterUseCase'

export const registerUseCase = new RegisterUseCase(createUserUseCase, authService)

export const registerResolver = new RegisterResolver(registerUseCase)

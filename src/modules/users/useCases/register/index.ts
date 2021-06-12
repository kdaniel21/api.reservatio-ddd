import { invitationRepository } from '@modules/users/repositories'
import { authService } from '@modules/users/services'
import { createUserUseCase } from '../createUser'
import RegisterResolver from './RegisterResolver'
import RegisterUseCase from './RegisterUseCase'

export const registerUseCase = new RegisterUseCase(createUserUseCase, authService, invitationRepository)

export const registerResolver = new RegisterResolver(registerUseCase)

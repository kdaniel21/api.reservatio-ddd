import { userRepository } from '@modules/users/repositories'
import ResetPasswordResolver from './ResetPasswordResolver'
import ResetPasswordUseCase from './ResetPasswordUseCase'

export const resetPasswordUseCase = new ResetPasswordUseCase(userRepository)

export const resetPasswordResolver = new ResetPasswordResolver(resetPasswordUseCase)

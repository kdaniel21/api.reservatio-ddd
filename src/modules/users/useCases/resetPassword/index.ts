import { userRepository } from '@modules/users/repositories'
import ResetPasswordController from './ResetPasswordController'
import ResetPasswordUseCase from './ResetPasswordUseCase'

export const resetPasswordUseCase = new ResetPasswordUseCase(userRepository)

export const resetPasswordController = new ResetPasswordController(resetPasswordUseCase)

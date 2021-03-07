import { userRepository } from '@modules/users/repositories'
import ChangePasswordUsingTokenController from './ChangePasswordUsingTokenController'
import ChangePasswordUsingTokenUseCase from './ChangePasswordUsingTokenUseCase'

export const changePasswordUsingTokenUseCase = new ChangePasswordUsingTokenUseCase(
  userRepository
)

export const changePasswordUsingTokenController = new ChangePasswordUsingTokenController(
  changePasswordUsingTokenUseCase
)

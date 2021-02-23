import { refreshTokenRepository, userRepository } from '@modules/users/repositories'
import LoginUseCase from './LoginUseCase'
import LoginController from './LoginController'
import { authService } from '@modules/users/services'

export const loginUseCase = new LoginUseCase(
  userRepository,
  refreshTokenRepository,
  authService
)

export const loginController = new LoginController(loginUseCase)

import { userRepository } from '@modules/users/repositories'
import { authService } from '@modules/users/services'
import RefreshAccessTokenController from './RefreshAccessTokenController'
import RefreshAccessTokenUseCase from './RefreshAccessTokenUseCase'

export const refreshAccessTokenUseCase = new RefreshAccessTokenUseCase(
  userRepository,
  authService
)

export const refreshAccessTokenController = new RefreshAccessTokenController(
  refreshAccessTokenUseCase
)

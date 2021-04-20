import { userRepository } from '@modules/users/repositories'
import { authService } from '@modules/users/services'
import RefreshAccessTokenResolver from './RefreshAccessTokenResolver'
import RefreshAccessTokenUseCase from './RefreshAccessTokenUseCase'

export const refreshAccessTokenUseCase = new RefreshAccessTokenUseCase(
  userRepository,
  authService
)

export const refreshAccessTokenResolver = new RefreshAccessTokenResolver(
  refreshAccessTokenUseCase
)

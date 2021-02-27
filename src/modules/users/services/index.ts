import { refreshTokenRepository } from '../repositories'
import JwtAuthService from './implementations/JwtAuthService'

export const authService = new JwtAuthService(refreshTokenRepository)

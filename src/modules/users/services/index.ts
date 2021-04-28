import { refreshTokenRepository } from '../repositories'
import JwtAuthService from './AuthService/JwtAuthService'

export const authService = new JwtAuthService(refreshTokenRepository)

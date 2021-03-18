import UserRole from './UserRole'

export interface JwtPayload {
  userId: string
  email: string
  role: UserRole
}

export type JwtToken = string

export interface JwtPayload {
  userId: string
  email: string
  isAdmin: boolean
}

export type JwtToken = string

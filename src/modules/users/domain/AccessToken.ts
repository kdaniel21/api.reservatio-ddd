export interface JwtPayload {
  userId: string
  email: string
}

export type JwtToken = string

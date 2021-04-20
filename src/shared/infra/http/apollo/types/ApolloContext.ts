import express from 'express'
import { JwtPayload } from '@modules/users/domain/AccessToken'

export default interface ApolloContext {
  user: JwtPayload
  req: express.Request
}

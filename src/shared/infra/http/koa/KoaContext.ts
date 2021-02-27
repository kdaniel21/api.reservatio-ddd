import { JwtPayload } from '@modules/users/domain/AccessToken'
import User from '@modules/users/domain/User'
import Koa from 'koa'

type JwtPayloadState = {
  auth?: JwtPayload
}

type AuthenticatedUserState = {
  auth?: User
}

export default interface KoaContext extends Koa.Context {
  state: JwtPayloadState | AuthenticatedUserState
}

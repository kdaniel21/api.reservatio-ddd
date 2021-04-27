import { JwtPayload } from '@modules/users/domain/AccessToken'
import Koa from 'koa'

export default interface ApolloContext {
  user: JwtPayload
  cookies: Koa.Context['cookies']
}

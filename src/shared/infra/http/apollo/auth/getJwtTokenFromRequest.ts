import { Result } from '@shared/core/Result'
import Koa from 'koa'

export default (request: Koa.Request) => {
  const bearerToken: string = request.headers.authorization || request.body.accessToken
  if (!bearerToken) return Result.fail()

  const token = bearerToken.replace('Bearer ', '')
  return Result.ok(token)
}

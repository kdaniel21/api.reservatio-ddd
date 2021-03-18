import { Result } from '@shared/core/Result'

export default (request: any) => {
  const bearerToken: string = request.headers.authorization || request.body.accessToken
  if (!bearerToken) return Result.fail()

  const token = bearerToken.replace('Bearer ', '')
  return Result.ok(token)
}

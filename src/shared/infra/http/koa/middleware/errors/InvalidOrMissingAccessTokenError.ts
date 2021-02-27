import { Failure } from '@shared/core/Result'
import KoaError from '../../KoaError'

export default class InvalidOrMissingAccessTokenError extends KoaError {
  constructor() {
    super({
      code: 'INVALID_ACCESS_TOKEN',
      message: 'Missing or invalid access token.',
      statusCode: 400,
    })
  }
}

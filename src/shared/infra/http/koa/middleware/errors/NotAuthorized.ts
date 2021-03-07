import KoaError from '../../KoaError'

export default class NotAuthorizedError extends KoaError {
  constructor() {
    super({
      message: `You are not authorized to perform this action!`,
      code: 'NOT_AUTHORIZED',
      statusCode: 401,
    })
  }
}

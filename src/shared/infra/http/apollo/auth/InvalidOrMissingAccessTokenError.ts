import { ApolloError } from 'apollo-server-koa'

export default class InvalidOrMissingAccessTokenError extends ApolloError {
  constructor() {
    super('Invalid or missing access token.', 'INVALID_ACCESS_TOKEN')
  }
}

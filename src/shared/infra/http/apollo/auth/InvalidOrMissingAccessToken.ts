import { ApolloError } from 'apollo-server'

export default class InvalidOrMissingAccessTokenError extends ApolloError {
  constructor() {
    super('Missing or invalid access token.', 'INVALID_ACCESS_TOKEN')
  }
}

import { AuthChecker } from 'type-graphql'
import ApolloContext from '../types/ApolloContext'
import InvalidOrMissingAccessTokenError from './InvalidOrMissingAccessToken'

const authChecker: AuthChecker<ApolloContext> = ({ context }) => {
  if (context.user) return true

  throw new InvalidOrMissingAccessTokenError()
}

export default authChecker

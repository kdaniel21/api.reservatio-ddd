import { AuthChecker } from 'type-graphql'
import ApolloContext from '../types/ApolloContext'

const authChecker: AuthChecker<ApolloContext> = ({ context }) => !!context.user

export default authChecker

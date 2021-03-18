import UserRole from '@modules/users/domain/UserRole'
import { AuthChecker } from 'type-graphql'
import ApolloContext from '../types/ApolloContext'

const authChecker: AuthChecker<ApolloContext, UserRole> = ({ context }, roles: UserRole[]) => {
  const { user } = context

  if (!roles.length) return !!user

  if (!user) return false

  return roles.some(allowedRole => allowedRole === user.role)
}

export default authChecker

import { userRepository } from '@modules/users/repositories'
import GetCurrentUserResolver from './GetCurrentUserResolver'

export const getCurrentUserResolver = new GetCurrentUserResolver(userRepository)

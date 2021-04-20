import { userRepository } from '@modules/users/repositories'
import Container from 'typedi'
import GetCurrentUserResolver from './GetCurrentUserResolver'

export const getCurrentUserResolver = new GetCurrentUserResolver(userRepository)

Container.set(GetCurrentUserResolver, getCurrentUserResolver)
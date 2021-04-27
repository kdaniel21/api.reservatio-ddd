import { userRepository } from '@modules/users/repositories'
import GetCurrentUserResolver from './GetCurrentUserResolver'
import GetCurrentUserUseCase from './GetCurrentUserUseCase'

export const getCurrentUserUseCase = new GetCurrentUserUseCase(userRepository)

export const getCurrentUserResolver = new GetCurrentUserResolver(getCurrentUserUseCase)

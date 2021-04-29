import { userRepository } from '@modules/users/repositories'
import ConfirmEmailResolver from './ConfirmEmailResolver'
import ConfirmEmailUseCase from './ConfirmEmailUseCase'

export const confirmEmailUseCase = new ConfirmEmailUseCase(userRepository)

export const confirmEmailResolver = new ConfirmEmailResolver(confirmEmailUseCase)

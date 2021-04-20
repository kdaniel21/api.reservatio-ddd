import { userRepository } from '@modules/users/repositories'
import Container from 'typedi'
import ChangePasswordUsingTokenResolver from './ChangePasswordUsingTokenResolver'
import ChangePasswordUsingTokenUseCase from './ChangePasswordUsingTokenUseCase'

export const changePasswordUsingTokenUseCase = new ChangePasswordUsingTokenUseCase(
  userRepository
)

export const changePasswordUsingTokenResolver = new ChangePasswordUsingTokenResolver(
  changePasswordUsingTokenUseCase
)

Container.set(ChangePasswordUsingTokenResolver, changePasswordUsingTokenResolver)
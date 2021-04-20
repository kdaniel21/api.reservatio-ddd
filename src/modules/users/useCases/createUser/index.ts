import Container from 'typedi'
import { userRepository } from '@modules/users/repositories'
import CreateUserResolver from './CreateUserResolver'
import CreateUserUseCase from './CreateUserUseCase'

export const createUserUseCase = new CreateUserUseCase(userRepository)

export const createUserResolver = new CreateUserResolver(createUserUseCase)

Container.set(CreateUserResolver, createUserResolver)

import { userRepository } from '@modules/users/repositories'
import CustomerResolver from './CustomerResolver'

export const customerResolver = new CustomerResolver(userRepository)

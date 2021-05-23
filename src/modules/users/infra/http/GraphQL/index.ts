import { customerRepository } from '@modules/reservation/repositories'
import UserResolver from './UserResolver'

export const userResolver = new UserResolver(customerRepository)

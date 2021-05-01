import { customerRepository } from '@modules/reservation/repositories'
import CreateCustomerUseCase from './CreateCustomerUseCase'

export const createCustomerUseCase = new CreateCustomerUseCase(customerRepository)

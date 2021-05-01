import { createCustomerUseCase } from '../useCases/createCustomer'
import AfterUserCreated from './AfterUserCreated'

new AfterUserCreated(createCustomerUseCase)

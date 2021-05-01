import CustomerName from '@modules/reservation/domain/CustomerName'
import User from '@modules/users/domain/User'

export default interface CreateCustomerUseCaseDto {
  user: User
  name: CustomerName
}

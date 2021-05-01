import Customer from '@modules/reservation/domain/Customer'
import CustomerName from '@modules/reservation/domain/CustomerName'
import CustomerRole from '@modules/reservation/domain/CustomerRole'
import CustomerRepository from '@modules/reservation/repositories/CustomerRepository/CustomerRepository'
import { PromiseErrorOr } from '@shared/core/DomainError'
import { Result } from '@shared/core/Result'
import UseCase from '@shared/core/UseCase'
import UniqueID from '@shared/domain/UniqueID'
import CreateCustomerUseCaseDto from './DTOs/CreateCustomerUseCaseDto'
import CreateCustomerUseCaseResultDto from './DTOs/CreateCustomerUseCaseResultDto'

export default class CreateCustomerUseCase extends UseCase<CreateCustomerUseCaseDto, CreateCustomerUseCaseResultDto> {
  constructor(private customerRepo: CustomerRepository) {
    super()
  }

  async executeImpl(request: CreateCustomerUseCaseDto): PromiseErrorOr<CreateCustomerUseCaseResultDto> {
    const customerOrError = Customer.create({
      userId: new UniqueID(request.user.userId.toString()),
      name: request.name,
      role: CustomerRole.Customer,
      reservations: [],
    })
    if (customerOrError.isFailure()) return Result.fail(customerOrError.error)

    const customer = customerOrError.value
    const saveResult = await this.customerRepo.save(customer)

    return saveResult.isSuccess() ? Result.ok({ customer }) : Result.fail(saveResult.error)
  }
}

import UserCreatedEvent from '@modules/users/domain/events/UserCreatedEvent'
import { PromiseErrorOr } from '@shared/core/DomainError'
import DomainEventSubscriber from '@shared/domain/events/DomainEventSubscriber'
import CreateCustomerUseCase from '../useCases/createCustomer/CreateCustomerUseCase'

export default class AfterUserCreated extends DomainEventSubscriber<UserCreatedEvent> {
  constructor(private createCustomerUseCase: CreateCustomerUseCase) {
    super(UserCreatedEvent.name)
  }

  async handleEvent(event: UserCreatedEvent): PromiseErrorOr<any> {
    const { name, user } = event

    return this.createCustomerUseCase.execute({ name, user })
  }
}

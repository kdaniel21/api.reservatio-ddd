import { DomainEvent } from '@shared/domain/events/DomainEvent'
import DomainEventSubscriber from '@shared/domain/events/DomainEventSubscriber'
import UserCreatedEvent from '../domain/events/UserCreatedEvent'

export default class AfterUserCreated extends DomainEventSubscriber {
  constructor() {
    super(UserCreatedEvent.name)
  }

  async handleEvent(event: DomainEvent): Promise<void> {
    console.log('A NEW USER HAS BEEN CREATED!!')
  }
}

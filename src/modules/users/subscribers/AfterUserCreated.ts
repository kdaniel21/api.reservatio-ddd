import { DomainEvent } from '@shared/domain/events/DomainEvent'
import DomainEvents from '@shared/domain/events/DomainEvents'
import DomainEventSubscriber from '@shared/domain/events/DomainEventSubscriber'
import UserCreatedEvent from '../domain/events/UserCreatedEvent'

export default class AfterUserCreated implements DomainEventSubscriber {
  constructor() {}

  setupSubscriptions(): void {
    DomainEvents.registerHandler(this.handleEvent.bind(this), UserCreatedEvent.name)
  }

  async handleEvent(event: DomainEvent): Promise<void> {}
}

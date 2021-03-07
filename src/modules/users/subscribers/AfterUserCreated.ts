import DomainEventSubscriber from '@shared/domain/events/DomainEventSubscriber'
import UserCreatedEvent from '../domain/events/UserCreatedEvent'

export default class AfterUserCreated extends DomainEventSubscriber<UserCreatedEvent> {
  constructor() {
    super(UserCreatedEvent.name)
  }

  async handleEvent(event: UserCreatedEvent): Promise<void> {
    console.log('A NEW USER HAS BEEN CREATED!!')
  }
}

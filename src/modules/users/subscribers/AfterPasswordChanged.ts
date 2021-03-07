import DomainEventSubscriber from '@shared/domain/events/DomainEventSubscriber'
import PasswordChangedEvent from '../domain/events/PasswordChangedEvent'

export default class AfterPasswordChanged extends DomainEventSubscriber<PasswordChangedEvent> {
  constructor() {
    super(PasswordChangedEvent.name)
  }

  async handleEvent(event: PasswordChangedEvent): Promise<void> {
    console.log('Password has been changed')
    console.log(event)
  }
}

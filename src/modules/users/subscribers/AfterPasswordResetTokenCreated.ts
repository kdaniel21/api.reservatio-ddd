import { DomainEvent } from '@shared/domain/events/DomainEvent'
import DomainEventSubscriber from '@shared/domain/events/DomainEventSubscriber'
import PasswordResetTokenCreatedEvent from '../domain/events/PasswordResetTokenCreatedEvent'

export default class AfterPasswordResetTokenCreated extends DomainEventSubscriber<PasswordResetTokenCreatedEvent> {
  constructor() {
    super(PasswordResetTokenCreatedEvent.name)
  }

  async handleEvent(event: PasswordResetTokenCreatedEvent): Promise<void> {
    console.log('password reset token created!!!')
    console.log(event)
  }
}

import DomainEventSubscriber from '@shared/domain/events/DomainEventSubscriber'
import MailerService from '@shared/services/MailerService/MailerService'
import { RegisterTemplate } from '@shared/services/MailerService/templates/RegisterTemplate'
import UserCreatedEvent from '../domain/events/UserCreatedEvent'

export default class AfterUserCreated extends DomainEventSubscriber<UserCreatedEvent> {
  constructor(private mailerService: MailerService) {
    super(UserCreatedEvent.name)
  }

  async handleEvent(event: UserCreatedEvent): Promise<void> {
    const { user } = event
    
    await this.mailerService.sendToUser(RegisterTemplate, user, { user })
  }
}

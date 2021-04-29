import DomainEventSubscriber from '@shared/domain/events/DomainEventSubscriber'
import { RegisterTemplate } from '@shared/services/MailerService/templates/RegisterTemplate'
import UserCreatedEvent from '../domain/events/UserCreatedEvent'
import SendEmailConfirmationUseCase from '../useCases/sendEmailConfirmation/SendEmailConfirmationUseCase'

export default class AfterUserCreated extends DomainEventSubscriber<UserCreatedEvent> {
  constructor(private sendEmailConfirmationUseCase: SendEmailConfirmationUseCase) {
    super(UserCreatedEvent.name)
  }

  async handleEvent(event: UserCreatedEvent): Promise<void> {
    const { user } = event

    await this.sendEmailConfirmationUseCase.execute({ email: user.email.value, EmailTemplate: RegisterTemplate })
  }
}

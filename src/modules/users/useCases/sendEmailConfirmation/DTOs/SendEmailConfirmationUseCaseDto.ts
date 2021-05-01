import CustomerName from '@modules/reservation/domain/CustomerName'
import User from '@modules/users/domain/User'
import { Template } from '@shared/services/MailerService/templates/BaseTemplate'

export default interface SendEmailConfirmationUseCaseDto {
  email: string
  name?: CustomerName
  EmailTemplate?: Template<{ user: User; name?: CustomerName }>
}

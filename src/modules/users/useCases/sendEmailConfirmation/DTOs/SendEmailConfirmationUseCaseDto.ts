import User from '@modules/users/domain/User'
import { Template } from '@shared/services/MailerService/templates/BaseTemplate'

export default interface SendEmailConfirmationUseCaseDto {
  email: string
  EmailTemplate?: Template<{ user: User }>
}

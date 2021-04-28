import User from '@modules/users/domain/User'
import { PromiseErrorOr } from '@shared/core/DomainError'

export default interface MailerService {
  // TODO: Proper template typing
  sendToUser(template: any, user: User): PromiseErrorOr
  sendToAddress(template: any, emailAddress: string): PromiseErrorOr
}

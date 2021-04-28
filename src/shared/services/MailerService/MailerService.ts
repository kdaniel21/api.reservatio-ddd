import User from '@modules/users/domain/User'
import { PromiseErrorOr } from '@shared/core/DomainError'
import { Template } from './templates/BaseTemplate'

export default interface MailerService {
  // TODO: Proper template typing
  sendToUser<T>(template: Template<T>, user: User, templateData?: T): PromiseErrorOr
  sendToAddress<T>(template: Template<T>, emailAddress: string, templateData: T): PromiseErrorOr
}

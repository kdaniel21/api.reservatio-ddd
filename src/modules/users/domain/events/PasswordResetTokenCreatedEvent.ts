import { DomainEvent } from '@shared/domain/events/DomainEvent'
import UniqueID from '@shared/domain/UniqueID'
import User from '../User'

export default class PasswordResetTokenCreatedEvent implements DomainEvent {
  dateTime: Date

  constructor(public user: User) {
    this.dateTime = new Date()
  }

  getAggregateId(): UniqueID {
    return this.user.id
  }
}

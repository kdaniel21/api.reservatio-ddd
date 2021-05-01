import CustomerName from '@modules/reservation/domain/CustomerName'
import { DomainEvent } from '@shared/domain/events/DomainEvent'
import UniqueID from '@shared/domain/UniqueID'
import User from '../User'

export default class UserCreatedEvent implements DomainEvent {
  dateTime: Date

  constructor(public user: User, public name: CustomerName) {
    this.dateTime = new Date()
  }

  getAggregateId(): UniqueID {
    return this.user.id
  }
}

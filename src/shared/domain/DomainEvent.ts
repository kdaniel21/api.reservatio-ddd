import UniqueID from './UniqueID'

export interface DomainEvent {
  dateTime: Date
  getAggregateId(): UniqueID
}

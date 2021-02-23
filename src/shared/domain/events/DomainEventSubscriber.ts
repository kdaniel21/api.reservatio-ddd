import { DomainEvent } from './DomainEvent'

export default interface DomainEventSubscriber {
  setupSubscriptions(): void
  handleEvent(event: DomainEvent): Promise<void> | void
}

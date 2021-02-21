import logger from '@shared/infra/Logger/logger'
import { DomainEvent } from './events/DomainEvent'
import Entity from './Entity'
import DomainEvents from './events/DomainEvents';
import UniqueID from './UniqueID'

export default abstract class AggregateRoot<T> extends Entity<T> {
  private events: DomainEvent[] = []

  get domainEvents(): DomainEvent[] {
    return this.events
  }

  clearEvents() {
    this.events = []
  }

  protected addDomainEvent(domainEvent: DomainEvent): void {
    this.events.push(domainEvent)

    // TODO: mark aggregate for dispatch
    DomainEvents.markAggregateForDispatch(this)

    this.logDomainEventAdded(domainEvent)
  }

  private logDomainEventAdded(domainEvent: DomainEvent) {
    const thisClass = Reflect.getPrototypeOf(this)
    const domainEventClass = Reflect.getPrototypeOf(domainEvent)
    logger.info(
      `[Domain Event Created]: ${thisClass.constructor.name} => ${domainEventClass.constructor.name}`
    )
  }
}

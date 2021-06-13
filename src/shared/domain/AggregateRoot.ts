import logger from '@shared/infra/Logger/logger'
import { DomainEvent } from './events/DomainEvent'
import Entity from './Entity'
import DomainEvents from './events/DomainEvents'

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
    this.logDomainEventAdded(domainEvent)

    DomainEvents.markAggregateForDispatch(this)
  }

  private logDomainEventAdded(domainEvent: DomainEvent) {
    const thisClass = Reflect.getPrototypeOf(this)
    const domainEventClass = Reflect.getPrototypeOf(domainEvent)
    logger.info(`[EVENTS]: ${thisClass.constructor.name} => ${domainEventClass.constructor.name} event has been added!`)
  }
}

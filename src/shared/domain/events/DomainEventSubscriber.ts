import logger from '@shared/infra/Logger/logger'
import { DomainEvent } from './DomainEvent'
import DomainEvents from './DomainEvents'

export default abstract class DomainEventSubscriber<Event = DomainEvent> {
  constructor(eventClassName: string) {
    this.initSubscriber(eventClassName)
  }

  initSubscriber(eventClassName: string): void {
    logger.info(`[EVENTS] Initializing subscriber ${this.constructor.name}...`)
    DomainEvents.registerHandler(this.handleEvent.bind(this), eventClassName)
  }

  abstract handleEvent(event: Event): Promise<void> | void
}

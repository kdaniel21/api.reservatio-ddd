import { PromiseErrorOr } from '@shared/core/DomainError'
import { Failure } from '@shared/core/Result'
import logger from '@shared/infra/Logger/logger'
import { DomainEvent } from './DomainEvent'
import DomainEvents from './DomainEvents'

export default abstract class DomainEventSubscriber<Event = DomainEvent> {
  constructor(private readonly eventClassName: string) {
    this.initSubscriber()
  }

  initSubscriber(): void {
    logger.info(`[EVENTS] Initializing subscriber ${this.constructor.name}...`)
    DomainEvents.registerHandler(this.execute.bind(this), this.eventClassName)
  }

  async execute(event: Event): Promise<void> {
    try {
      const result = await this.handleEvent(event)

      if (result instanceof Failure) throw result.error
    } catch (err) {
      logger.error(`[SUBSCRIBERS] Error while executing ${this.eventClassName}: ${err}`)
    }
  }

  abstract handleEvent(event: Event): Promise<void> | void | PromiseErrorOr<any>
}

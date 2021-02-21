import AggregateRoot from '../AggregateRoot'
import { DomainEvent } from './DomainEvent'
import UniqueID from '../UniqueID'
import logger from '@shared/infra/Logger/logger'

export default class DomainEvents {
  private static handlersMap: { [eventClassName: string] any } = {}
  private static markedAggregatesList: AggregateRoot<any>[] = []

  static markAggregateForDispatch(aggregate: AggregateRoot<any>): void {
    const isAggregateAlreadyMarked = !!this.findMarkedAggregateById(aggregate.id)
    if (isAggregateAlreadyMarked) return

    this.markedAggregatesList.push(aggregate)
    logger.info(
      `[EVENTS] Aggregate ${aggregate.id} has been marked for dispatch. Waiting for ORM to complete transaction...`
    )
  }

  static dispatchEventsForAggregate(id: UniqueID): void {
    const aggregate = this.findMarkedAggregateById(id)
    if (!aggregate) return

    this.dispatchAggregateEvents(aggregate)
    aggregate.clearEvents()
    this.removeAggregateFromDispatchList(aggregate)
  }

  static registerHandler(handler: (event: DomainEvent) => any, eventClassName: string): void {
    if (!this.handlersMap[eventClassName]) {
      this.handlersMap[eventClassName] = []
    }

    this.handlersMap[eventClassName].push(handler)
    logger.info(
      `[EVENTS] Handler ${handler.name} for ${eventClassName} event has been registered.`
    )
  }

  private static findMarkedAggregateById(id: UniqueID): AggregateRoot<any> | undefined {
    return this.markedAggregatesList.find(aggregate => aggregate.id.equals(id))
  }

  private static dispatchAggregateEvents(aggregate: AggregateRoot<any>): void {
    aggregate.domainEvents.forEach(domainEvent => {
      this.dispatch(domainEvent)
    })
  }

  private static dispatch(domainEvent: DomainEvent): void {
    const eventClassName: string = domainEvent.constructor.name
    const handlers: any[] = this.handlersMap[eventClassName]
    if (!handlers) return

    logger.info(
      `[EVENTS] ${handlers.length} handlers have been dispatched for event ${eventClassName}.`
    )
    handlers.forEach(handler => {
      handler(domainEvent)
    })
  }

  private static removeAggregateFromDispatchList(aggregate: AggregateRoot<any>): void {
    const aggregateIndex = this.markedAggregatesList.findIndex(markedAggregate =>
      markedAggregate.id.equals(aggregate.id)
    )

    this.markedAggregatesList.splice(aggregateIndex, 1)
    logger.info(`[EVENTS] Aggregate ${aggregate.id} has been removed from dispatch list.`)
  }
}

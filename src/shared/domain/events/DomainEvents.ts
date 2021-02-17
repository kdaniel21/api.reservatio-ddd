import AggregateRoot from '../AggregateRoot'
import { DomainEvent } from '../DomainEvent'
import UniqueID from '../UniqueID'

export default class DomainEvents {
  private static handlersMap: { [eventClassName: string]: any } = {}
  private static markedAggregatesList: AggregateRoot<any>[] = []

  static markAggregateForDispatch(aggreate: AggregateRoot<any>): void {
    const isAggregateAlreadyMarked = !!this.findMarkedAggregateById(aggreate.id)
    if (isAggregateAlreadyMarked) return

    this.markedAggregatesList.push(aggreate)
  }

  static dispatchEventsForAggregate(id: UniqueID): void {
    const aggregate = this.findMarkedAggregateById(id)
    if (!aggregate) return

    this.dispatchAggregateEvents(aggregate)
    aggregate.clearEvents()
    this.removeAggregateFromDispatchList(aggregate)
  }

  static registerHandler(
    handler: (event: DomainEvent) => any,
    eventClassName: string
  ): void {
    if (!this.handlersMap[eventClassName]) {
      this.handlersMap[eventClassName] = []
    }

    this.handlersMap[eventClassName].push(handler)
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

    handlers.forEach(handler => {
      handler(domainEvent)
    })
  }

  private static removeAggregateFromDispatchList(aggregate: AggregateRoot<any>): void {
    const aggregateIndex = this.markedAggregatesList.findIndex(markedAggregate =>
      markedAggregate.id.equals(aggregate.id)
    )

    this.markedAggregatesList.splice(aggregateIndex, 1)
  }
}

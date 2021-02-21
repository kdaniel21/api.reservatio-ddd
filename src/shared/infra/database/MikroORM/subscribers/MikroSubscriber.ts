import { EventArgs, EventSubscriber, Subscriber } from '@mikro-orm/core'
import DomainEvents from '@shared/domain/events/DomainEvents'
import UniqueID from '@shared/domain/UniqueID'
import MikroBaseEntity from '../entities/MikroBaseEntity'

@Subscriber()
export default class MikroSubscriber implements EventSubscriber {
  async afterCreate<T extends MikroBaseEntity>(args: EventArgs<T>): Promise<void> {
    this.handleIncomingEvent(args)
  }

  async afterUpdate<T extends MikroBaseEntity>(args: EventArgs<T>): Promise<void> {
    this.handleIncomingEvent(args)
  }

  async afterDelete<T extends MikroBaseEntity>(args: EventArgs<T>): Promise<void> {
    this.handleIncomingEvent(args)
  }

  private handleIncomingEvent<T extends MikroBaseEntity>(args: EventArgs<T>): void {
    const id = new UniqueID(args.entity.id)

    DomainEvents.dispatchEventsForAggregate(id)
  }
}

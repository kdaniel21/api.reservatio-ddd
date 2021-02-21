import { EventSubscriber, Subscriber } from '@mikro-orm/core'

@Subscriber()
export default class MikroSubscriber implements EventSubscriber {}

import { ArgsType, Field } from 'type-graphql'
import IsRecurringTimeAvailableArgs from '../../isRecurringTimeAvailable/DTOs/IsRecurringTimeAvailableArgs'

@ArgsType()
export default class CreateRecurringReservationArgs extends IsRecurringTimeAvailableArgs {
  @Field()
  name: string
}

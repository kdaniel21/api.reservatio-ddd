import { GraphQLReservationLocationInput } from '@modules/reservation/infra/http/GraphQL/GraphQLReservationLocation'
import { ArgsType, Field, registerEnumType } from 'type-graphql'
import { IsRecurringTimeAvailableDto, Recurrence, TimePeriod } from './IsRecurringTimeAvailableUseCaseDto'

@ArgsType()
export default class IsRecurringTimeAvailableArgs implements IsRecurringTimeAvailableDto {
  @Field()
  startTime: Date

  @Field()
  endTime: Date

  @Field(() => [Date], { defaultValue: [] })
  includedDates: Date[]

  @Field(() => [Date], { defaultValue: [] })
  excludedDates: Date[]

  @Field(() => GraphQLReservationLocationInput)
  locations: GraphQLReservationLocationInput

  @Field(() => Recurrence, { defaultValue: Recurrence.Weekly })
  recurrence: Recurrence

  @Field(() => TimePeriod, { defaultValue: TimePeriod.HalfYear })
  timePeriod: TimePeriod
}

registerEnumType(TimePeriod, { name: 'TimePeriod' })

registerEnumType(Recurrence, { name: 'Recurrence' })

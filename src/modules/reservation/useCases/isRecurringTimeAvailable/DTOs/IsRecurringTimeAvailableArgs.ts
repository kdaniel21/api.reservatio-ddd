import { GraphQLReservationLocationInput } from '@modules/reservation/infra/http/GraphQL/GraphQLReservationLocation'
import { ArgsType, Field, registerEnumType } from 'type-graphql'
import { IsRecurringTimeAvailableDto, Recurrence, TimePeriod } from './IsRecurringTimeAvailableUseCaseDto'

@ArgsType()
export default class IsRecurringTimeAvailableArgs implements IsRecurringTimeAvailableDto {
  @Field()
  startTime: Date

  @Field()
  endTime: Date

  @Field(() => [Date], { nullable: true })
  includedDates?: Date[]

  @Field(() => [Date], { nullable: true })
  excludedDates?: Date[]

  @Field(() => GraphQLReservationLocationInput)
  locations: GraphQLReservationLocationInput

  @Field(() => Recurrence)
  recurrence: Recurrence

  @Field(() => TimePeriod)
  timePeriod: TimePeriod
}

registerEnumType(TimePeriod, { name: 'TimePeriod' })

registerEnumType(Recurrence, { name: 'Recurrence' })

import { Field, ObjectType } from 'type-graphql'
import IsRecurringTimeAvailableResultDto from './IsRecurringTimeAvailableResultDto'

@ObjectType()
export default class IsRecurringTimeAvailableResponseDto implements IsRecurringTimeAvailableResultDto {
  @Field(() => [Date])
  availableTimes: Date[]

  @Field(() => [Date])
  unavailableTimes: Date[]
}

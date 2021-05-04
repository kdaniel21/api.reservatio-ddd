import { Field, ObjectType } from 'type-graphql'

@ObjectType()
export default class IsRecurringTimeAvailableResponseDto {
  @Field(() => [Date])
  availableTimes: Date[]

  @Field(() => [Date])
  unavailableTimes: Date[]
}

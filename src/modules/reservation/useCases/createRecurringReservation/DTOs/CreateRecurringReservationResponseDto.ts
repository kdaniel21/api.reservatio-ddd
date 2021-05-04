import { Field, ObjectType } from 'type-graphql'

@ObjectType()
export default class CreateRecurringReservationResponseDto {
  @Field()
  count: number

  @Field()
  recurringId: string
}

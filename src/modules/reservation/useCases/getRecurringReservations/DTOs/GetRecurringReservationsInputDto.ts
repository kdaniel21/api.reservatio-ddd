import { ArgsType, Field, ID } from 'type-graphql'

@ArgsType()
export default class GetRecurringReservationsInputDto {
  @Field(() => ID)
  recurringId: string

  @Field({ defaultValue: false })
  futureOnly: boolean
}

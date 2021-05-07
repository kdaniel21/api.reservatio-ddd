import { ArgsType, Field } from 'type-graphql'

@ArgsType()
export default class GetReservationsArgs {
  @Field(() => Date)
  startDate: Date

  @Field(() => Date)
  endDate: Date
}

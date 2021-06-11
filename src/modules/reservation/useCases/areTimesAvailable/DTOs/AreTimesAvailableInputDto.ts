import { GraphQLReservationLocationInput } from '@modules/reservation/infra/http/GraphQL/GraphQLReservationLocation'
import { Field, ID, InputType } from 'type-graphql'

@InputType()
export default class TimeAvailableInputDto {
  @Field()
  startTime: Date

  @Field()
  endTime: Date

  @Field(() => GraphQLReservationLocationInput)
  locations: GraphQLReservationLocationInput

  @Field(() => ID, { nullable: true })
  excludedReservation?: string
}

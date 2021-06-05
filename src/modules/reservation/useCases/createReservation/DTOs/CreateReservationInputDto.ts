import { GraphQLReservationLocationInput } from '@modules/reservation/infra/http/GraphQL/GraphQLReservationLocation'
import { ArgsType, Field } from 'type-graphql'

@ArgsType()
export default class CreateReservationInputDto {
  @Field()
  name: string

  @Field()
  startTime: Date

  @Field()
  endTime: Date

  @Field(() => GraphQLReservationLocationInput)
  locations: GraphQLReservationLocationInput
}

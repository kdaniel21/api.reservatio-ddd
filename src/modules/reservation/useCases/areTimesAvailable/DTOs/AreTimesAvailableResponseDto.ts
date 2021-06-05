import { GraphQLReservationLocationOutput } from '@modules/reservation/infra/http/GraphQL/GraphQLReservationLocation'
import { Field, ObjectType } from 'type-graphql'

@ObjectType()
export default class AreTimesAvailableResponseDto {
  @Field()
  startTime: Date

  @Field()
  endTime: Date

  @Field(() => GraphQLReservationLocationOutput)
  locations: GraphQLReservationLocationOutput

  @Field()
  isTimeAvailable: boolean
}

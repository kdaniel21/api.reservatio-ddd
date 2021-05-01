import { ReservationLocationEnum } from '@modules/reservation/domain/ReservationLocation'
import { ArgsType, Field } from 'type-graphql'
import '@modules/reservation/infra/http/GraphQL/ReservationLocationEnum'

@ArgsType()
export default class IsTimeAvailableInputDto {
  @Field()
  startTime: Date

  @Field()
  endTime: Date

  @Field(() => [ReservationLocationEnum])
  locations: ReservationLocationEnum[]
}

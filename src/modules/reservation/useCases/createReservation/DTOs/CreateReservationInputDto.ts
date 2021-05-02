import { ArgsType, Field } from 'type-graphql'
import IsTimeAvailableInputDto from '../../isTimeAvailable/DTOs/IsTimeAvailableInputDto'

@ArgsType()
export default class CreateReservationInputDto extends IsTimeAvailableInputDto {
  @Field()
  name: string
}

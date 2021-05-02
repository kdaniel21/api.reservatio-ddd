import ReservationLocationDto from '@modules/reservation/DTOs/ReservationLocationDto'
import { Field, InputType, ObjectType } from 'type-graphql'

@InputType()
export class GraphQLReservationLocationInput implements ReservationLocationDto {
  @Field({ nullable: true, defaultValue: false })
  tableTennis: boolean

  @Field({ nullable: true, defaultValue: false })
  badminton: boolean
}

@ObjectType()
export class GraphQLReservationLocationOutput implements ReservationLocationDto {
  @Field()
  tableTennis: boolean

  @Field()
  badminton: boolean
}

import ReservationDto from '@modules/reservation/DTOs/ReservationDto'
import { Field, ID, ObjectType } from 'type-graphql'
import GraphQLCustomer from './GraphQLCustomer.'
import { GraphQLReservationLocationOutput } from './GraphQLReservationLocation'

@ObjectType()
export default class GraphQLReservation implements ReservationDto {
  @Field(() => ID)
  id: string

  @Field(() => ID, { nullable: true })
  recurringId?: string

  @Field()
  name: string

  @Field()
  isActive: boolean

  @Field(() => GraphQLCustomer)
  customer: GraphQLCustomer

  @Field()
  startTime: Date

  @Field()
  endTime: Date

  @Field(() => GraphQLReservationLocationOutput)
  locations: GraphQLReservationLocationOutput

  @Field()
  createdAt: Date

  @Field()
  updatedAt: Date
}

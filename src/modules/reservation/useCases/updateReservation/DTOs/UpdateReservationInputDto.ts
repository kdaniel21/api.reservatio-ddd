import { ArgsType, Field, ID, InputType } from 'type-graphql'

@InputType()
class UpdateLocationInput {
  @Field({ nullable: true })
  badminton?: boolean

  @Field({ nullable: true })
  tableTennis?: boolean
}

@InputType()
class UpdatedProperties {
  @Field({ nullable: true })
  name?: string

  @Field({ nullable: true })
  startTime?: Date

  @Field({ nullable: true })
  endTime?: Date

  @Field(() => UpdateLocationInput, { nullable: true })
  locations?: UpdateLocationInput

  @Field({ nullable: true })
  isActive?: boolean
}

@ArgsType()
export default class UpdateReservationInputDto {
  @Field(() => ID!)
  id: string

  @Field(() => UpdatedProperties)
  updatedProperties: UpdatedProperties

  @Field(() => [ID], { defaultValue: [] })
  connectedUpdates?: string[]
}

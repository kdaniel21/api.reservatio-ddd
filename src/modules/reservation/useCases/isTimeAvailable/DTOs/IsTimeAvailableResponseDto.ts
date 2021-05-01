import { Field, ObjectType } from 'type-graphql'

@ObjectType()
export default class IsTimeAvailableResponseDto {
  @Field()
  isTimeAvailable: boolean
}

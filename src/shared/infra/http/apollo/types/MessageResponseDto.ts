import { Field, ObjectType } from 'type-graphql'

@ObjectType()
export default class MessageResponseDto {
  @Field()
  message: string
}

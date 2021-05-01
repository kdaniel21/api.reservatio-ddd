import UserDto from '@modules/users/DTOs/UserDto'
import { Field, ObjectType } from 'type-graphql'

@ObjectType()
export default class GraphQLUser implements UserDto {
  @Field()
  id: string

  @Field()
  email: string

  @Field()
  isEmailConfirmed: boolean
}

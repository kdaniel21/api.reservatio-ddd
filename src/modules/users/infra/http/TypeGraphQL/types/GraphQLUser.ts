import UserDto from '@modules/users/DTOs/UserDto'
import { Field, ObjectType, registerEnumType } from 'type-graphql'

@ObjectType()
export default class GraphQLUser implements UserDto {
  @Field()
  id: string

  @Field()
  email: string

  @Field()
  name: string

  @Field()
  isEmailConfirmed: boolean
}

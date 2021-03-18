import UserDto from '@modules/users/DTOs/UserDto'
import { Field, ObjectType } from 'type-graphql'

@ObjectType()
export default class GraphQLUser implements UserDto {
  @Field()
  email: string

  @Field()
  name: string

  @Field()
  isAdmin: boolean

  @Field()
  isEmailConfirmed: boolean
}

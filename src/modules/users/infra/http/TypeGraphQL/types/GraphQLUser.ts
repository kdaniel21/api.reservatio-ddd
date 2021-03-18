import UserRole from '@modules/users/domain/UserRole'
import UserDto from '@modules/users/DTOs/UserDto'
import { Field, ObjectType, registerEnumType } from 'type-graphql'

@ObjectType()
export default class GraphQLUser implements UserDto {
  @Field()
  email: string

  @Field()
  name: string

  @Field()
  role: UserRole

  @Field()
  isEmailConfirmed: boolean
}

registerEnumType(UserRole, {
  name: 'UserRole',
  description: 'The role of the user.',
})

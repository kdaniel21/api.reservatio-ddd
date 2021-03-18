import { IsEmail } from 'class-validator'
import { Field, InputType, ObjectType } from 'type-graphql'

@InputType({ description: 'The login mutation.' })
export default class LoginInputDto {
  @IsEmail()
  @Field()
  email: string

  @Field()
  password: string
}

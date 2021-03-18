import { Field, ObjectType } from 'type-graphql'

@ObjectType()
export default class HealthCheckResponse {
  @Field()
  name: string

  @Field()
  status: string

  @Field()
  version: string

  @Field()
  currentTime: Date
}

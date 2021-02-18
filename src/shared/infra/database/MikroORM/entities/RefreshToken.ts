import { Property } from '@mikro-orm/core'
import BaseEntity from './BaseEntity'

export default class RefreshTokenEntity extends BaseEntity {
  @Property()
  token!: string

  @Property()
  expiresAt!: Date

  @Property()
  userId!: string
}

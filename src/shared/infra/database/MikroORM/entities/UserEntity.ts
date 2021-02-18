import { Collection, Entity, OneToMany, Property } from '@mikro-orm/core'
import BaseEntity from './BaseEntity'
import RefreshTokenEntity from './RefreshToken'

@Entity()
export default class UserEntity extends BaseEntity {
  @Property()
  name!: string

  @Property()
  email!: string

  @Property()
  password!: string

  @OneToMany(() => RefreshTokenEntity, refreshToken => refreshToken.userId)
  refreshTokens = new Collection<RefreshTokenEntity>(this)

  @Property()
  passwordResetToken!: string

  @Property()
  passwordResetTokenExpiresAt!: Date

  @Property()
  isAdmin: boolean = false

  @Property()
  isDeleted: boolean = false

  @Property()
  isEmailConfirmed: boolean = false
}

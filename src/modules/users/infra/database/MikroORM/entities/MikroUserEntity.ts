import { Collection, Entity, EntityData, OneToMany, Property } from '@mikro-orm/core'
import MikroBaseEntity from '@shared/infra/database/MikroORM/entities/MikroBaseEntity'
import MikroRefreshTokenEntity from './MikroRefreshTokenEntity'

@Entity()
export default class MikroUserEntity extends MikroBaseEntity {
  @Property()
  name!: string

  @Property()
  email!: string

  @Property()
  password!: string

  // @OneToMany(() => MikroRefreshTokenEntity, refreshToken => refreshToken.userId)
  // refreshTokens = new Collection<MikroRefreshTokenEntity>(this)

  @Property()
  passwordResetToken?: string

  @Property()
  passwordResetTokenExpiresAt?: Date

  @Property()
  isAdmin: boolean = false

  @Property()
  isDeleted: boolean = false

  @Property()
  isEmailConfirmed: boolean = false

  constructor(userEntityProps: EntityData<MikroUserEntity>) {
    super()
    Object.assign(this, userEntityProps)
  }
}

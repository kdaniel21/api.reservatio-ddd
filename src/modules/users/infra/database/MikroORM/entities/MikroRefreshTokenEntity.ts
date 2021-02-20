import { EntityData, Property } from '@mikro-orm/core'
import MikroBaseEntity from '@shared/infra/database/MikroORM/entities/MikroBaseEntity'
import MikroUserEntity from './MikroUserEntity'

export default class MikroRefreshTokenEntity extends MikroBaseEntity {
  @Property()
  token!: string

  @Property()
  expiresAt!: Date

  @Property()
  userId!: MikroUserEntity

  constructor(refreshTokenEntityProps: EntityData<MikroRefreshTokenEntity>) {
    super()
    Object.assign(this, refreshTokenEntityProps)
  }
}

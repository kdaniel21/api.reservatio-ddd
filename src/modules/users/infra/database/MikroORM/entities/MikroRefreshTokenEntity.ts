import { Entity, EntityData, Property } from '@mikro-orm/core'
import MikroBaseEntity from '@shared/infra/database/MikroORM/entities/MikroBaseEntity'
import MikroUserEntity from './MikroUserEntity'

@Entity({ tableName: 'refresh_tokens' })
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

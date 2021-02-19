import { PrimaryKey, Property } from '@mikro-orm/core'

export default abstract class MikroBaseEntity {
  @PrimaryKey()
  id!: string

  // TODO: Enable createdAt & updatedAt
  // @Property()
  // createdAt: Date = new Date()

  // @Property({ onUpdate: () => new Date() })
  // updatedAt: Date = new Date()
}

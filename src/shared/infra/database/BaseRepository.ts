export default interface BaseRepository<E, OrmE> {
  findMany(condition?: Partial<OrmE>): Promise<E[]>
  findOne(condition?: Partial<OrmE>): Promise<E | null>
  save(entity: E): Promise<void>
  toOrmEntity(entity: E): Promise<OrmE> | OrmE
}

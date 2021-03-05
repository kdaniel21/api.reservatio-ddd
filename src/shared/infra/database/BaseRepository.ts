export default interface BaseRepository<E, OrmE> {
  findMany?(condition?: Partial<OrmE>, fields?: { [field: string]: boolean }): Promise<E[]>
  findOne?(condition?: Partial<OrmE>, fields?: { [field: string]: boolean }): Promise<E | null>
  save?(entity: E): Promise<void>
  deleteOne?(entity: E): Promise<void>
  toOrmEntity?(entity: E): Promise<OrmE> | OrmE
}

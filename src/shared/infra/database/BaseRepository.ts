import Entity from '@shared/domain/Entity'

export default interface BaseRepository {
  save(entity: Entity<any>): Promise<void>
  toOrmEntity(entity: Entity<any>): Promise<any> | any
}

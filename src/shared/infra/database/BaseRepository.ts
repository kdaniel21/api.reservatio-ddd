import { PromiseErrorOr } from '@shared/core/DomainError'
import UniqueID from '@shared/domain/UniqueID'

export default interface BaseRepository<Entity, OrmEntity> {
  findMany?(condition?: Partial<OrmEntity>, include?: { [field: string]: boolean }): PromiseErrorOr<Entity[]>
  findOne?(condition: Partial<OrmEntity>, include?: { [field: string]: boolean }): PromiseErrorOr<Entity>
  findById?(id: UniqueID, include?: { [field: string]: boolean }): PromiseErrorOr<Entity>
  count?(condition: Partial<OrmEntity>): PromiseErrorOr<number>
  save?(entity: Entity): PromiseErrorOr
  deleteOne?(entity: Entity): PromiseErrorOr<void>
  toOrmEntity?(entity: Entity): Promise<OrmEntity> | OrmEntity
}

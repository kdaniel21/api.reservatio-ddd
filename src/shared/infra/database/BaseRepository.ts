import { ErrorOr, PromiseErrorOr } from '@shared/core/DomainError'
import UniqueID from '@shared/domain/UniqueID'

export default interface BaseRepository<Entity, OrmEntity> {
  findMany?(condition?: Partial<OrmEntity>, include?: { [field: string]: boolean }): PromiseErrorOr<Entity[]>
  findOne?(condition: Partial<OrmEntity>, include?: { [field: string]: boolean }): PromiseErrorOr<Entity>
  findById?(id: UniqueID, include?: { [field: string]: boolean }): PromiseErrorOr<Entity>
  save?(entity: Entity): PromiseErrorOr<void>
  deleteOne?(entity: Entity): PromiseErrorOr<void>
  toOrmEntity?(entity: Entity): Promise<OrmEntity> | OrmEntity
}

import Entity from './Entity'
import UniqueID from './UniqueID'

export default abstract class AggregateRoot<T> extends Entity<T> {
  // TODO: Implement event queueing
  get id(): UniqueID {
    return this._id
  }
}

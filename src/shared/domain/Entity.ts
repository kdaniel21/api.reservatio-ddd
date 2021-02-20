import UniqueID from './UniqueID'

export default abstract class Entity<T> {
  constructor(public readonly props: T, public readonly id: UniqueID = new UniqueID()) {}
}

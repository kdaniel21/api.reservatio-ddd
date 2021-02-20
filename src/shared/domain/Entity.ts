import UniqueID from './UniqueID'

export default abstract class Entity<T> {
  constructor(public readonly props: T, protected readonly id: UniqueID = new UniqueID()) {}
}

import UniqueID from './UniqueID'

export default abstract class Entity<T> {
  constructor(public readonly props: T, protected readonly _id: UniqueID = new UniqueID()) {}
}

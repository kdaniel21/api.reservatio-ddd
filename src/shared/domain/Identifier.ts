export default class Identifier<T> {
  constructor(private value: T) {}

  equals(id?: Identifier<T>): boolean {
    const isInstance = id instanceof this.constructor
    if (id === null || id === undefined || !isInstance) return false

    return id.toValue() === this.value
  }

  toString(): string {
    return String(this.value)
  }

  toValue(): T {
    return this.value
  }
}

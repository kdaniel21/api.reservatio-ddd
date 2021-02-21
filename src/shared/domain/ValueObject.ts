interface ValueObjectProps {
  [key: string]: any
}

export default abstract class ValueObject<T extends ValueObjectProps> {
  constructor(protected props: T) {}

  equals(valueObject: ValueObject<T>): boolean {
    const propsStringified = JSON.stringify(this.props)
    const valueObjectStringified = JSON.stringify(valueObject.props)

    return propsStringified === valueObjectStringified
  }
}

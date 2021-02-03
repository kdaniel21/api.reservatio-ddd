interface ValueObjectProps {
  [key: string]: any
}

export default abstract class ValueObject<T extends ValueObjectProps> {
  constructor(public props: T) {
    this.props = { ...props }
  }

  equals(valueObject: ValueObject<T>): boolean {
    const propsStringified = JSON.stringify(this.props)
    const valueObjectStringified = JSON.stringify(valueObject.props)

    return propsStringified === valueObjectStringified
  }
}

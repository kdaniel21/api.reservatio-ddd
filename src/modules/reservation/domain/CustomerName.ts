import { ErrorOr } from '@shared/core/DomainError'
import { Guard } from '@shared/core/Guard'
import { Result } from '@shared/core/Result'
import ValueObject from '@shared/domain/ValueObject'
import InvalidCustomerNameError from './errors/InvalidCustomerNameError'

interface CustomerNameProps {
  name: string
}

export default class CustomerName extends ValueObject<CustomerNameProps> {
  static MAX_NAME_LENGTH = 25

  static MIN_NAME_LENGTH = 5

  get value() {
    return this.props.name
  }

  private constructor(props: CustomerNameProps) {
    super(props)
  }

  static create(name: string): ErrorOr<CustomerName> {
    const guardArgument = { argument: name, argumentName: 'name' }
    const guardResult = Guard.combine([
      Guard.againstNullOrUndefined(guardArgument),
      Guard.againstLongerThan(this.MAX_NAME_LENGTH, guardArgument),
      Guard.againstShorterThan(this.MIN_NAME_LENGTH, guardArgument),
    ])
    if (!guardResult.isSuccess) {
      const message = guardResult.message as string

      return Result.fail(new InvalidCustomerNameError(message))
    }

    const customerName = new CustomerName({ name })
    return Result.ok(customerName)
  }
}

import { AppError } from '@shared/core/AppError'
import { ErrorOr } from '@shared/core/DomainError'
import { Guard } from '@shared/core/Guard'
import { Result } from '@shared/core/Result'
import AggregateRoot from '@shared/domain/AggregateRoot'
import UniqueID from '@shared/domain/UniqueID'
import CustomerName from './CustomerName'
import CustomerRole from './CustomerRole'
import Reservation from './Reservation'

interface CustomerProps {
  userId: UniqueID
  name: CustomerName
  role: CustomerRole
  reservations?: Reservation[]
}

export default class Customer extends AggregateRoot<CustomerProps> {
  get customerId(): UniqueID {
    return this.id
  }

  get userId(): UniqueID {
    return this.props.userId
  }

  get reservations(): Reservation[] {
    return this.props.reservations
  }

  get name(): CustomerName {
    return this.props.name
  }

  get role(): CustomerRole {
    return this.props.role
  }

  constructor(props: CustomerProps, id?: UniqueID) {
    super(props, id)
  }

  static create(props: CustomerProps, id?: UniqueID): ErrorOr<Customer> {
    const guardResult = Guard.againstNullOrUndefinedBulk([
      { argument: props.userId, argumentName: 'userId' },
      { argument: props.name, argumentName: 'name' },
    ])
    if (!guardResult.isSuccess) return Result.fail(new AppError.UndefinedArgumentError(guardResult.message))

    const customer = new Customer(
      {
        role: CustomerRole.Customer,
        ...props,
        reservations: [],
      },
      id,
    )

    return Result.ok(customer)
  }
}

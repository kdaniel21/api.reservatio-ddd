import { AppError } from '@shared/core/AppError'
import { ErrorOr } from '@shared/core/DomainError'
import { Guard } from '@shared/core/Guard'
import { Result } from '@shared/core/Result'
import AggregateRoot from '@shared/domain/AggregateRoot'
import UniqueID from '@shared/domain/UniqueID'
import Customer from './Customer'
import CustomerRole from './CustomerRole'
import ReservationLocation from './ReservationLocation'
import ReservationName from './ReservationName'
import ReservationTime from './ReservationTime'

interface ReservationProps {
  recurringId?: UniqueID
  name: ReservationName
  customer: Customer
  time: ReservationTime
  isActive?: boolean
  locations: ReservationLocation
  createdAt?: Date
  updatedAt?: Date
}

export default class Reservation extends AggregateRoot<ReservationProps> {
  get reservationId(): UniqueID {
    return this.id
  }

  get recurringId(): UniqueID {
    return this.props.recurringId
  }

  get name(): ReservationName {
    return this.props.name
  }

  get customer(): Customer {
    return this.props.customer
  }

  get time(): ReservationTime {
    return this.props.time
  }

  get isActive(): boolean {
    return this.props.isActive
  }

  get locations(): ReservationLocation {
    return this.props.locations
  }

  get createdAt(): Date {
    return this.props.createdAt
  }

  get updatedAt(): Date {
    return this.props.updatedAt
  }

  private constructor(props: ReservationProps, id?: UniqueID) {
    super(props, id)
  }

  static create(props: ReservationProps, id?: UniqueID): ErrorOr<Reservation> {
    const guardResult = Guard.againstNullOrUndefinedBulk([
      { argument: props.customer, argumentName: 'customer' },
      { argument: props.name, argumentName: 'name' },
      { argument: props.time, argumentName: 'time' },
      { argument: props.locations, argumentName: 'locations' },
    ])

    if (!guardResult.isSuccess) return Result.fail(new AppError.UndefinedArgumentError(guardResult.message))

    const reservation = new Reservation(
      {
        ...props,
        isActive: props.isActive ?? true,
        createdAt: props.createdAt ?? new Date(),
        updatedAt: props.updatedAt ?? new Date(),
      },
      id,
    )

    return Result.ok(reservation)
  }

  canUpdate(customer: Customer): boolean {
    const isAdmin = customer.role === CustomerRole.Admin

    const doesReservationBelongToCustomer = this.customer.id.equals(customer.id)
    const isReservationPast = this.time.startTime.getTime() < Date.now()
    const canNormalCustomerEdit = doesReservationBelongToCustomer && !isReservationPast && this.isActive

    return canNormalCustomerEdit || isAdmin
  }

  canAccess(customer: Customer): boolean {
    const isAdmin = customer.role === CustomerRole.Admin

    const doesReservationBelongToCustomer = this.customer.id.equals(customer.id)
    const canNormalCustomerAccess = doesReservationBelongToCustomer && this.isActive

    return canNormalCustomerAccess || isAdmin
  }
}

import { Result } from '@shared/core/Result'
import UniqueID from '@shared/domain/UniqueID'
import BaseMapper from '@shared/infra/BaseMapper'
import logger from '@shared/infra/Logger/logger'
import Customer from '../domain/Customer'
import CustomerName from '../domain/CustomerName'
import CustomerRole from '../domain/CustomerRole'
import Reservation from '../domain/Reservation'
import CustomerDto from '../DTOs/CustomerDto'
import ReservationMapper from './ReservationMapper'

function getEnumKeyByEnumValue<T extends { [index: string]: string }>(myEnum: T, enumValue: string): keyof T | null {
  let keys = Object.keys(myEnum).filter(x => myEnum[x] == enumValue)
  return keys.length > 0 ? keys[0] : null
}

export default class CustomerMapper implements BaseMapper<Customer> {
  static toDto(customer: Customer): CustomerDto {
    return {
      id: customer.customerId.toString(),
      userId: customer.userId.toString(),
      name: customer.name.value,
      reservations: customer.reservations.map(reservation => ReservationMapper.toDto(reservation)),
      role: customer.role,
    }
  }

  static toDomain(raw: any): Customer {
    const nameOrError = CustomerName.create(raw.name)

    const combinedResult = Result.combine([nameOrError])
    if (combinedResult.isFailure()) logger.error(`Error while mapping to domain: ${combinedResult.error.message}`)

    const userId = new UniqueID(raw.userId)
    const role: CustomerRole = raw.role

    let reservations: Reservation[] = []
    if (raw.reservations)
      reservations = raw.reservations.map((rawReservation: any) => ReservationMapper.toDomain(rawReservation))

    const customerOrError = Customer.create(
      {
        userId,
        name: nameOrError.value,
        role,
        reservations,
      },
      new UniqueID(raw.id)
    )

    if (customerOrError.isFailure()) logger.error(`Error while mapping to domain: ${combinedResult.error.message}`)

    return customerOrError.value
  }

  static toObject(customer: Customer) {
    return {
      id: customer.customerId.toString(),
      userId: customer.userId.toString(),
      name: customer.name.value,
      reservations: customer.reservations.map(reservation => ReservationMapper.toObject(reservation)),
      role: customer.role,
    }
  }
}

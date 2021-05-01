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

export default class CustomerMapper implements BaseMapper<Customer> {
  static toDto(customer: Customer): CustomerDto {
    return {
      id: customer.customerId.toString(),
      userId: customer.userId.toString(),
      name: customer.name.value,
      reservations: customer.reservations.map(reservation => ReservationMapper.toDto(reservation)),
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

    const customerOrError = Customer.create({
      userId,
      name: nameOrError.value,
      role,
      reservations,
    })

    if (customerOrError.isFailure()) logger.error(`Error while mapping to domain: ${combinedResult.error.message}`)

    return customerOrError.value
  }

  static toObject(customer: Customer) {
    return {
      id: customer.customerId.toString(),
      userId: customer.userId.toString(),
      name: customer.name.value,
      reservations: customer.reservations.map(reservation => ReservationMapper.toObject(reservation)),
    }
  }
}

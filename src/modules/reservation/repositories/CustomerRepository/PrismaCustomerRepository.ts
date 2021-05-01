import { PrismaClient } from '.prisma/client'
import Customer from '@modules/reservation/domain/Customer'
import CustomerMapper from '@modules/reservation/mappers/CustomerMapper'
import { AppError } from '@shared/core/AppError'
import { PromiseErrorOr } from '@shared/core/DomainError'
import { Result } from '@shared/core/Result'
import logger from '@shared/infra/Logger/logger'
import CustomerRepository from './CustomerRepository'

export default class PrismaCustomerRepository implements CustomerRepository {
  constructor(private prisma: PrismaClient) {}

  async save(customer: Customer): PromiseErrorOr {
    try {
      const { reservations, ...userObject } = CustomerMapper.toObject(customer)

      await this.prisma.prismaCustomer.upsert({
        create: userObject,
        update: userObject,
        where: { id: customer.customerId.toString() },
      })
      return Result.ok()
    } catch (err) {
      logger.error(err)

      return Result.fail(AppError.UnexpectedError)
    }
  }
}

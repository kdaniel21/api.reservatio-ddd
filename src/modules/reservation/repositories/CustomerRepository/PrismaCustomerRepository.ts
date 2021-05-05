import { Prisma, PrismaClient, PrismaCustomer } from '.prisma/client'
import Customer from '@modules/reservation/domain/Customer'
import CustomerMapper from '@modules/reservation/mappers/CustomerMapper'
import { AppError } from '@shared/core/AppError'
import { PromiseErrorOr } from '@shared/core/DomainError'
import { Result } from '@shared/core/Result'
import UniqueID from '@shared/domain/UniqueID'
import logger from '@shared/infra/Logger/logger'
import CustomerRepository from './CustomerRepository'

export default class PrismaCustomerRepository implements CustomerRepository<PrismaCustomer> {
  constructor(private prisma: PrismaClient) {}

  async findByUserId(userId: UniqueID, include?: Prisma.PrismaCustomerInclude): PromiseErrorOr<Customer> {
    return this.findOne({ userId: userId.toString() }, include)
  }

  async findById(id: UniqueID, include?: Prisma.PrismaCustomerInclude): PromiseErrorOr<Customer> {
    return this.findOne({ id: id.toString() }, include)
  }

  async findOne(where: Partial<PrismaCustomer>, include?: Prisma.PrismaCustomerInclude): PromiseErrorOr<Customer> {
    try {
      const prismaCustomer = await this.prisma.prismaCustomer.findFirst({ where, include })
      if (!prismaCustomer) return Result.fail()

      const user = CustomerMapper.toDomain(prismaCustomer)
      return Result.ok(user)
    } catch (err) {
      logger.error(err)

      return Result.fail(AppError.UnexpectedError)
    }
  }

  async save(customer: Customer): PromiseErrorOr {
    try {
      const { reservations, userId, ...customerObject } = CustomerMapper.toObject(customer)

      await this.prisma.prismaCustomer.upsert({
        create: { ...customerObject, role: customerObject.role as any, user: { connect: { id: userId } } },
        update: { ...customerObject, role: customerObject.role as any, user: { connect: { id: userId } } },
        where: { id: customer.customerId.toString() },
      })
      return Result.ok()
    } catch (err) {
      logger.error(err)

      return Result.fail(AppError.UnexpectedError)
    }
  }
}

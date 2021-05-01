import prisma from '@shared/infra/database/prisma/prisma'
import PrismaCustomerRepository from './CustomerRepository/PrismaCustomerRepository'

export const customerRepository = new PrismaCustomerRepository(prisma)

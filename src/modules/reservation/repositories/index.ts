import prisma from '@shared/infra/database/prisma/prisma'
import PrismaCustomerRepository from './CustomerRepository/PrismaCustomerRepository'
import PrismaReservationRepository from './ReservationRepository/PrismaReservationRepository'

export const customerRepository = new PrismaCustomerRepository(prisma)

export const reservationRepository = new PrismaReservationRepository(prisma)

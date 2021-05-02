import Reservation from '@modules/reservation/domain/Reservation'
import ReservationLocation from '@modules/reservation/domain/ReservationLocation'
import ReservationTime from '@modules/reservation/domain/ReservationTime'
import ReservationMapper from '@modules/reservation/mappers/ReservationMapper'
import { PrismaClient, PrismaReservation } from '@prisma/client'
import { AppError } from '@shared/core/AppError'
import { PromiseErrorOr } from '@shared/core/DomainError'
import { Result } from '@shared/core/Result'
import logger from '@shared/infra/Logger/logger'
import ReservationRepository from './ReservationRepository'

export default class PrismaReservationRepository implements ReservationRepository<PrismaReservation> {
  constructor(private prisma: PrismaClient) {}

  async isTimeAvailable(time: ReservationTime, location: ReservationLocation): PromiseErrorOr<boolean> {
    try {
      const count = await this.prisma.prismaReservation.count({
        where: {
          startTime: { lt: time.endTime },
          endTime: { gt: time.startTime },
          OR: [{ tableTennis: location.tableTennis }, { badminton: location.badminton }],
        },
      })

      const isAvailable = count === 0
      return Result.ok(isAvailable)
    } catch (err) {
      return Result.fail(err)
    }
  }

  async save(reservation: Reservation): PromiseErrorOr {
    try {
      const { customer, ...reservationObject } = ReservationMapper.toObject(reservation)

      await this.prisma.prismaReservation.upsert({
        create: { ...reservationObject, customerId: customer.id },
        update: reservationObject,
        where: { id: reservation.id.toString() },
      })
      return Result.ok()
    } catch (err) {
      logger.error(err)

      return Result.fail(AppError.UnexpectedError)
    }
  }
}

import Reservation from '@modules/reservation/domain/Reservation'
import ReservationLocation from '@modules/reservation/domain/ReservationLocation'
import ReservationTime from '@modules/reservation/domain/ReservationTime'
import ReservationMapper from '@modules/reservation/mappers/ReservationMapper'
import { prisma, PrismaClient, PrismaReservation } from '@prisma/client'
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

  async isTimeAvailableBulk(
    times: ReservationTime[],
    location: ReservationLocation
  ): PromiseErrorOr<Map<ReservationTime, boolean>> {
    try {
      const queries = times.map(time =>
        this.prisma.prismaReservation.count({
          where: {
            startTime: { lt: time.endTime },
            endTime: { gt: time.startTime },
            OR: [{ tableTennis: location.tableTennis }, { badminton: location.badminton }],
          },
        })
      )

      const queryResult = await this.prisma.$transaction(queries)
      const result = new Map(times.map((time, index) => [time, queryResult[index] === 0]))

      return Result.ok(result)
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

  async saveBulk(reservations: Reservation[]): PromiseErrorOr {
    try {
      const upsertOperations = reservations.map(reservation => {
        const { customer, ...reservationObject } = ReservationMapper.toObject(reservation)

        return this.prisma.prismaReservation.upsert({
          create: { ...reservationObject, customerId: customer.id },
          update: reservationObject,
          where: { id: reservation.id.toString() },
        })
      })

      await this.prisma.$transaction(upsertOperations)
      return Result.ok()
    } catch (err) {
      logger.error(err)
      return Result.fail(AppError.UnexpectedError)
    }
  }
}

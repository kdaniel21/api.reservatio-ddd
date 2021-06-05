import Reservation from '@modules/reservation/domain/Reservation'
import ReservationLocation from '@modules/reservation/domain/ReservationLocation'
import ReservationTime from '@modules/reservation/domain/ReservationTime'
import ReservationTimeProposalDto from '@modules/reservation/DTOs/ReservationTimeProposalDto'
import ReservationMapper from '@modules/reservation/mappers/ReservationMapper'
import { Prisma, PrismaClient, PrismaReservation } from '@prisma/client'
import { AppError } from '@shared/core/AppError'
import { PromiseErrorOr } from '@shared/core/DomainError'
import { Result } from '@shared/core/Result'
import UniqueID from '@shared/domain/UniqueID'
import logger from '@shared/infra/Logger/logger'
import ReservationRepository from './ReservationRepository'

export default class PrismaReservationRepository implements ReservationRepository<PrismaReservation> {
  constructor(private prisma: PrismaClient) {}

  async findById(reservationId: UniqueID): PromiseErrorOr<Reservation> {
    return this.findOne({ id: reservationId.toString() })
  }

  async findOne(
    where: Partial<PrismaReservation>,
    include: Prisma.PrismaReservationInclude = { customer: true }
  ): PromiseErrorOr<Reservation> {
    try {
      const reservationObject = await this.prisma.prismaReservation.findFirst({ where, include })
      if (!reservationObject) return Result.fail()

      return Result.ok(ReservationMapper.toDomain(reservationObject))
    } catch (err) {
      logger.error(err)
      return Result.fail(AppError.UnexpectedError)
    }
  }

  async findMany(
    where: Partial<PrismaReservation>,
    include: Prisma.PrismaReservationInclude = { customer: true }
  ): PromiseErrorOr<Reservation[]> {
    try {
      const reservationObjects = await this.prisma.prismaReservation.findMany({ where, include })
      if (!reservationObjects.length) return Result.fail()

      const reservations = reservationObjects.map(reservationObject => ReservationMapper.toDomain(reservationObject))
      return Result.ok(reservations)
    } catch (err) {
      logger.error(err)
      return Result.fail(AppError.UnexpectedError)
    }
  }

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
      logger.error(err)
      return Result.fail(AppError.UnexpectedError)
    }
  }

  async isTimeAvailableBulk(
    proposals: ReservationTimeProposalDto[]
  ): PromiseErrorOr<(ReservationTimeProposalDto & { isAvailable: boolean })[]> {
    try {
      const queries = proposals.map(proposal =>
        this.prisma.prismaReservation.count({
          where: {
            startTime: { lt: proposal.time.endTime },
            endTime: { gt: proposal.time.startTime },
            OR: [{ tableTennis: proposal.location.tableTennis }, { badminton: proposal.location.badminton }],
          },
        })
      )

      const queryResult = await this.prisma.$transaction(queries)
      const result = proposals.map((proposal, index) => ({ ...proposal, isAvailable: queryResult[index] === 0 }))

      return Result.ok(result)
    } catch (err) {
      logger.error(err)
      return Result.fail(AppError.UnexpectedError)
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

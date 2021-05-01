import { ReservationLocation } from '@modules/reservation/domain/ReservationLocation'
import ReservationTime from '@modules/reservation/domain/ReservationTime'
import { PrismaClient, PrismaReservation } from '@prisma/client'
import { PromiseErrorOr } from '@shared/core/DomainError'
import { Result } from '@shared/core/Result'
import ReservationRepository from './ReservationRepository'

export default class PrismaReservationRepository implements ReservationRepository<PrismaReservation> {
  constructor(private prisma: PrismaClient) {}

  async isTimeAvailable(time: ReservationTime, location: ReservationLocation): PromiseErrorOr<boolean> {
    try {
      const count = await this.prisma.prismaReservation.count({
        where: {
          AND: [
            {
              OR: [
                { startTime: { gt: time.startTime }, AND: { startTime: { lt: time.endTime } } },
                { endTime: { gt: time.startTime }, AND: { endTime: { lt: time.endTime } } },
                { startTime: { lt: time.startTime }, AND: { endTime: { gt: time.endTime } } },
              ],
            },
            {
              OR: [{ tableTennis: location.tableTennis }, { badminton: location.badminton }],
            },
          ],
        },
      })

      const isAvailable = count === 0
      return Result.ok(isAvailable)
    } catch (err) {
      return Result.fail(err)
    }
  }
}

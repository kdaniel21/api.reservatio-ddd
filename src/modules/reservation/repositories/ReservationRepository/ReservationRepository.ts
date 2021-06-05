import Reservation from '@modules/reservation/domain/Reservation'
import ReservationLocation from '@modules/reservation/domain/ReservationLocation'
import ReservationTime from '@modules/reservation/domain/ReservationTime'
import ReservationTimeProposalDto from '@modules/reservation/DTOs/ReservationTimeProposalDto'
import { PromiseErrorOr } from '@shared/core/DomainError'
import BaseRepository from '@shared/infra/database/BaseRepository'

export default interface ReservationRepository<OrmE = any> extends BaseRepository<Reservation, OrmE> {
  isTimeAvailable(time: ReservationTime, location: ReservationLocation): PromiseErrorOr<boolean>
  isTimeAvailableBulk(
    proposals: ReservationTimeProposalDto[]
  ): PromiseErrorOr<(ReservationTimeProposalDto & { isAvailable: boolean })[]>
  saveBulk(reservations: Reservation[]): PromiseErrorOr
}

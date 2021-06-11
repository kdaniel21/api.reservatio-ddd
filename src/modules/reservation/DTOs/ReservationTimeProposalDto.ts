import UniqueID from '@shared/domain/UniqueID'
import ReservationLocation from '../domain/ReservationLocation'
import ReservationTime from '../domain/ReservationTime'

export default interface ReservationTimeProposalDto {
  time: ReservationTime
  location: ReservationLocation
  excludedId?: UniqueID
}

import ReservationLocation from '../domain/ReservationLocation'
import ReservationTime from '../domain/ReservationTime'

export default interface ReservationTimeProposalDto {
  time: ReservationTime
  location: ReservationLocation
}

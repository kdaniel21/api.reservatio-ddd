import ReservationTime from '@modules/reservation/domain/ReservationTime'

export default interface IsRecurringTimeAvailableResultDto {
  availableTimes: ReservationTime[]
  unavailableTimes: ReservationTime[]
}

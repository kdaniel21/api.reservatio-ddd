import { ReservationLocationEnum } from '@modules/reservation/domain/ReservationLocation'

export default interface IsTimeAvailableUseCaseDto {
  startTime: Date
  endTime: Date
  locations: { tableTennis: boolean; badminton: boolean }
}

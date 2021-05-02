import ReservationLocationDto from '@modules/reservation/DTOs/ReservationLocationDto'

export default interface IsTimeAvailableUseCaseDto {
  startTime: Date
  endTime: Date
  locations: ReservationLocationDto
}

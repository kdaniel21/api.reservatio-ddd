import ReservationLocationDto from '@modules/reservation/DTOs/ReservationLocationDto'

interface TimeProposalDto {
  startTime: Date
  endTime: Date
  locations: ReservationLocationDto
}

type AreTimesAvailableUseCaseDto = TimeProposalDto[]
export default AreTimesAvailableUseCaseDto

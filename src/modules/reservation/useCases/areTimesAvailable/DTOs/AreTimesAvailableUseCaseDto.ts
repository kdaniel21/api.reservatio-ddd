import ReservationLocationDto from '@modules/reservation/DTOs/ReservationLocationDto'
import UniqueID from '@shared/domain/UniqueID'

interface TimeProposalDto {
  startTime: Date
  endTime: Date
  locations: ReservationLocationDto
  // Can be used for updates to not validate against itself
  excludedReservationId?: UniqueID
}

type AreTimesAvailableUseCaseDto = TimeProposalDto[]
export default AreTimesAvailableUseCaseDto

import ReservationLocation from '@modules/reservation/domain/ReservationLocation'
import ReservationTime from '@modules/reservation/domain/ReservationTime'

interface IsTimeAvailableDto {
  time: ReservationTime
  location: ReservationLocation
  isAvailable: boolean
}

type AreTimesAvailableUseCaseResultDto = IsTimeAvailableDto[]
export default AreTimesAvailableUseCaseResultDto

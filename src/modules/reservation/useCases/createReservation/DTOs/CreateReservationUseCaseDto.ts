import ReservationLocationDto from '@modules/reservation/DTOs/ReservationLocationDto'
import { JwtPayload } from '@modules/users/domain/AccessToken'

export default interface CreateReservationUseCaseDto {
  name: string
  startTime: Date
  endTime: Date
  locations: ReservationLocationDto
  user: JwtPayload
}

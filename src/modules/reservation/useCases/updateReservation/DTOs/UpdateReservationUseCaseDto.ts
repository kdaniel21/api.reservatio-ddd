import ReservationDto from '@modules/reservation/DTOs/ReservationDto'
import ReservationLocationDto from '@modules/reservation/DTOs/ReservationLocationDto'
import { JwtPayload } from '@modules/users/domain/AccessToken'
import UniqueID from '@shared/domain/UniqueID'

type PropertiesToUpdate = Pick<ReservationDto, 'endTime' | 'startTime' | 'name' | 'isActive'> & {
  locations: Partial<ReservationLocationDto>
}

export default interface UpdateReservationUseCaseDto {
  id: UniqueID
  updatedProperties: Partial<PropertiesToUpdate>
  connectedUpdates: UniqueID[]
  redactedUser: JwtPayload
}

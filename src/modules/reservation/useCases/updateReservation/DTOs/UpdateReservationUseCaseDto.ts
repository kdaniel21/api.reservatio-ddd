import ReservationDto from '@modules/reservation/DTOs/ReservationDto'
import ReservationLocationDto from '@modules/reservation/DTOs/ReservationLocationDto'
import AuthorizedUseCaseDto from '@shared/core/UseCase/AuthorizedUseCaseDto'
import UniqueID from '@shared/domain/UniqueID'

type PropertiesToUpdate = Pick<ReservationDto, 'endTime' | 'startTime' | 'name' | 'isActive'> & {
  locations: Partial<ReservationLocationDto>
}

export default interface UpdateReservationUseCaseDto extends AuthorizedUseCaseDto {
  id: UniqueID
  updatedProperties: Partial<PropertiesToUpdate>
  connectedUpdates: UniqueID[]
}

import { JwtPayload } from '@modules/users/domain/AccessToken'
import UniqueID from '@shared/domain/UniqueID'

export default interface GetReservationUseCaseDto {
  reservationId: UniqueID
  redactedUser: JwtPayload
}

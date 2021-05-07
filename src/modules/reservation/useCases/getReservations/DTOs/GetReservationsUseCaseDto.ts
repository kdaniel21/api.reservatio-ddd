import { JwtPayload } from '@modules/users/domain/AccessToken'

export default interface GetReservationUseCase {
  startDate: Date
  endDate: Date
  redactedUser: JwtPayload
}

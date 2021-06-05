import { JwtPayload } from '@modules/users/domain/AccessToken'
import UniqueID from '@shared/domain/UniqueID'

export default interface GetRecurringReservationsUseCaseDto {
  recurringId: UniqueID
  redactedUser: JwtPayload
  futureOnly?: boolean
}

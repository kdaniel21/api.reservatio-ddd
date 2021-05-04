import { JwtPayload } from '@modules/users/domain/AccessToken'
import { IsRecurringTimeAvailableDto } from '../../isRecurringTimeAvailable/DTOs/IsRecurringTimeAvailableUseCaseDto'

export default interface CreateRecurringReservationUseCaseDto extends IsRecurringTimeAvailableDto {
  name: string
  redactedUser: JwtPayload
}

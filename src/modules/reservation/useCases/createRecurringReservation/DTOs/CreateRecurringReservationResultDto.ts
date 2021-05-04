import UniqueID from '@shared/domain/UniqueID'

export default interface CreateRecurringReservationResultDto {
  count: number
  recurringId: UniqueID
}

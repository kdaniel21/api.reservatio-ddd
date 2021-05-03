import ReservationLocationDto from '@modules/reservation/DTOs/ReservationLocationDto'

export enum Recurrence {
  Weekly = 'WEEKLY',
  Monthly = 'MONTHLY',
}

export enum TimePeriod {
  HalfYear = 'HALF_YEAR',
  CurrentYear = 'CURRENT_YEAR',
}

export interface IsRecurringTimeAvailableDto {
  startTime: Date
  endTime: Date
  excludedDates?: Date[]
  includedDates?: Date[]
  locations: ReservationLocationDto
  recurrence: Recurrence
  timePeriod: TimePeriod
}

import ReservationLocation from '@modules/reservation/domain/ReservationLocation'
import ReservationTime from '@modules/reservation/domain/ReservationTime'
import ReservationRepository from '@modules/reservation/repositories/ReservationRepository/ReservationRepository'
import { PromiseErrorOr } from '@shared/core/DomainError'
import { Result } from '@shared/core/Result'
import UseCase from '@shared/core/UseCase'
import DateUtils from '@shared/utils/DateUtils'
import AreTimesAvailableErrors from '../areTimesAvailable/AreTimesAvailableErrors'
import IsRecurringTimeAvailableResultDto from './DTOs/IsRecurringTimeAvailableResultDto'
import { IsRecurringTimeAvailableDto, Recurrence, TimePeriod } from './DTOs/IsRecurringTimeAvailableUseCaseDto'

export default class IsRecurringTimeAvailableUseCase extends UseCase<
  IsRecurringTimeAvailableDto,
  IsRecurringTimeAvailableResultDto
> {
  constructor(private reservationRepo: ReservationRepository) {
    super()
  }

  async executeImpl(request: IsRecurringTimeAvailableDto): PromiseErrorOr<IsRecurringTimeAvailableResultDto> {
    const doesReservationStartInPast = request.startTime.getTime() < Date.now()
    if (doesReservationStartInPast) return Result.fail(AreTimesAvailableErrors.PastTimeError)

    const { recurrence, timePeriod, includedDates = [], locations } = request
    const excludedDates = request.excludedDates?.map(date => date.getTime()) || []

    const recurringDates = this.getDatesWithRecurrence(request.startTime, timePeriod, recurrence)
    const extendedDates = [...recurringDates, ...includedDates]
    const filteredDates = extendedDates.filter(date => !excludedDates.includes(date.getTime()))

    const timeDifference = request.endTime.getTime() - request.startTime.getTime()
    const plainReservationDates = filteredDates.map(startTime => ({
      startTime,
      endTime: new Date(startTime.getTime() + timeDifference),
    }))

    const locationOrError = ReservationLocation.create(locations)
    const reservationTimeResults = plainReservationDates.map(({ startTime, endTime }) =>
      ReservationTime.create(startTime, endTime)
    )
    const combinedResult = Result.combine([...reservationTimeResults, locationOrError])
    if (combinedResult.isFailure()) return Result.fail(combinedResult.error)

    const reservationTimes = reservationTimeResults.map(reservationTimeResult => reservationTimeResult.value)
    const location = locationOrError.value
    const timeProposalsOrError = await this.reservationRepo.isTimeAvailableBulk(
      reservationTimes.map(time => ({ time, location }))
    )
    if (timeProposalsOrError.isFailure()) return Result.fail(timeProposalsOrError.error)

    const timeAvailability = timeProposalsOrError.value
    const availableTimes: ReservationTime[] = []
    const unavailableTimes: ReservationTime[] = []
    timeAvailability.forEach(time => {
      time.isAvailable ? availableTimes.push(time.time) : unavailableTimes.push(time.time)
    })

    return Result.ok({ availableTimes, unavailableTimes })
  }

  private getDatesWithRecurrence(startTime: Date, timePeriod: TimePeriod, recurrence: Recurrence): Date[] {
    const lastDate =
      timePeriod === TimePeriod.CurrentYear ? DateUtils.lastDayOfCurrentYear() : DateUtils.addMonths(new Date(), 6)

    return recurrence === Recurrence.Weekly
      ? DateUtils.getWeeklyInterval(startTime, lastDate)
      : DateUtils.getMonthlyInterval(startTime, lastDate)
  }
}

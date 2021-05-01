import { ErrorOr } from '@shared/core/DomainError'
import { GuardArguments, Guard } from '@shared/core/Guard'
import { Result } from '@shared/core/Result'
import ValueObject from '@shared/domain/ValueObject'
import InvalidReservationTimeError from './errors/InvalidReservationTimeError'

interface ReservationTimeProps {
  startTime: Date
  endTime: Date
}

export default class ReservationTime extends ValueObject<ReservationTimeProps> {
  static MAX_RESERVATION_HOURS = 4
  static MIN_RESERVATION_HOURS = 0.5

  get startTime(): Date {
    return this.props.startTime
  }

  get endTime(): Date {
    return this.props.endTime
  }

  get length(): Date {
    return new Date(this.endTime.getTime() - this.startTime.getTime())
  }

  get lengthHours(): number {
    return this.length.getTime() * 1000 * 60 * 60
  }

  private constructor(props: ReservationTimeProps) {
    super(props)
  }

  static create(startTime: Date, endTime: Date): ErrorOr<ReservationTime> {
    const startTimeGuardArgument: GuardArguments = { argument: startTime, argumentName: 'startTime' }
    const endTimeGuardArgument: GuardArguments = { argument: endTime, argumentName: 'endTime' }
    const guardResult = Guard.combine([
      Guard.againstNullOrUndefined(startTimeGuardArgument),
      Guard.isDate(startTimeGuardArgument),
      Guard.againstNullOrUndefined(endTimeGuardArgument),
      Guard.isDate(endTimeGuardArgument),
    ])
    if (!guardResult.isSuccess) return Result.fail(new InvalidReservationTimeError(guardResult.message))

    const isEndTimeLaterThanStart = endTime.getTime() > startTime.getTime()
    if (!isEndTimeLaterThanStart)
      return Result.fail(new InvalidReservationTimeError(`The 'endTime' must be later in time than the 'startTime'.`))

    const millisecondDifference = endTime.getTime() - startTime.getTime()
    const hourDifference = millisecondDifference / 60 / 60 / 1000
    if (hourDifference < this.MIN_RESERVATION_HOURS || hourDifference > this.MAX_RESERVATION_HOURS)
      return Result.fail(
        new InvalidReservationTimeError(
          `The time difference must be between ${this.MIN_RESERVATION_HOURS} and ${this.MAX_RESERVATION_HOURS} hours!`
        )
      )

    const reservationTime = new ReservationTime({ startTime, endTime })
    return Result.ok(reservationTime)
  }
}

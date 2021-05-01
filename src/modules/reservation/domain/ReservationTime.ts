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

    const reservationTime = new ReservationTime({ startTime, endTime })
    return Result.ok(reservationTime)
  }
}

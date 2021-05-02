import { ErrorOr } from '@shared/core/DomainError'
import { Guard, GuardArguments } from '@shared/core/Guard'
import { Result } from '@shared/core/Result'
import ValueObject from '@shared/domain/ValueObject'
import InvalidReservationNameError from './errors/InvalidReservationNameError'

interface ReservationNameProps {
  name: string
}

export default class ReservationName extends ValueObject<ReservationNameProps> {
  static MIN_NAME_LENGTH = 3
  static MAX_NAME_LENGTH = 40

  get value(): string {
    return this.props.name
  }

  private constructor(props: ReservationNameProps) {
    super(props)
  }

  static create(name: string): ErrorOr<ReservationName> {
    const guardArgument: GuardArguments = { argument: name, argumentName: 'name' }
    const guardResult = Guard.combine([
      Guard.againstNullOrUndefined(guardArgument),
      Guard.againstLongerThan(this.MAX_NAME_LENGTH, guardArgument),
      Guard.againstShorterThan(this.MIN_NAME_LENGTH, guardArgument),
    ])
    if (!guardResult.isSuccess) return Result.fail(new InvalidReservationNameError(guardResult.message))

    const reservationName = new ReservationName({ name })
    return Result.ok(reservationName)
  }
}

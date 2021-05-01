import { ErrorOr } from '@shared/core/DomainError'
import { Result } from '@shared/core/Result'
import ValueObject from '@shared/domain/ValueObject'
import InvalidReservationLocationError from './errors/InvalidReservationLocationError'

export enum Location {
  TABLE_TENNIS = 'TABLE_TENNIS',
  BADMINTON = 'BADMINTON',
}

type ReservationLocationProps = {
  [key in keyof typeof Location]: boolean
}

export class ReservationLocation extends ValueObject<ReservationLocationProps> {
  get tableTennis(): boolean {
    return this.props.TABLE_TENNIS
  }

  get badminton(): boolean {
    return this.props.BADMINTON
  }

  private constructor(props: ReservationLocationProps) {
    super(props)
  }

  static create({ tableTennis = false, badminton = false }): ErrorOr<ReservationLocation> {
    if (!tableTennis && !badminton) return Result.fail(InvalidReservationLocationError)

    const reservationLocation = new ReservationLocation({ TABLE_TENNIS: tableTennis, BADMINTON: badminton })
    return Result.ok(reservationLocation)
  }
}

import { ErrorOr } from '@shared/core/DomainError'
import { Result } from '@shared/core/Result'
import ValueObject from '@shared/domain/ValueObject'
import InvalidReservationLocationError from './errors/InvalidReservationLocationError'

type ReservationLocationProps = {
  tableTennis: boolean
  badminton: boolean
}

export default class ReservationLocation extends ValueObject<ReservationLocationProps> {
  get tableTennis(): boolean {
    return this.props.tableTennis
  }

  get badminton(): boolean {
    return this.props.badminton
  }

  private constructor(props: ReservationLocationProps) {
    super(props)
  }

  static create({ badminton = false, tableTennis = false }: ReservationLocationProps): ErrorOr<ReservationLocation> {
    if (!tableTennis && !badminton) return Result.fail(InvalidReservationLocationError)

    const reservationLocation = new ReservationLocation({ tableTennis, badminton })
    return Result.ok(reservationLocation)
  }
}

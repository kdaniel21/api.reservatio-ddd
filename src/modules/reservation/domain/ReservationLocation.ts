import { ErrorOr } from '@shared/core/DomainError'
import { Result } from '@shared/core/Result'
import ValueObject from '@shared/domain/ValueObject'
import InvalidReservationLocationError from './errors/InvalidReservationLocationError'

export enum ReservationLocationEnum {
  TableTennis = 'TABLE_TENNIS',
  Badminton = 'BADMINTON',
}

type ReservationLocationProps = {
  [key in keyof typeof ReservationLocationEnum]: boolean
}

export class ReservationLocation extends ValueObject<ReservationLocationProps> {
  get tableTennis(): boolean {
    return this.props.TableTennis
  }

  get badminton(): boolean {
    return this.props.Badminton
  }

  private constructor(props: ReservationLocationProps) {
    super(props)
  }

  static create({ tableTennis = false, badminton = false }): ErrorOr<ReservationLocation> {
    if (!tableTennis && !badminton) return Result.fail(InvalidReservationLocationError)

    const reservationLocation = new ReservationLocation({ TableTennis: tableTennis, Badminton: badminton })
    return Result.ok(reservationLocation)
  }
}

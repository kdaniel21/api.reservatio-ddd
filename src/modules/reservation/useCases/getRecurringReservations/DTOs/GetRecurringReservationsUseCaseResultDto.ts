import Reservation from '@modules/reservation/domain/Reservation'

export default class GetRecurringReservationsUseCaseResultDto {
  reservations: Reservation[]
}

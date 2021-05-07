import Reservation from '@modules/reservation/domain/Reservation'

export default interface GetReservationsUseCaseResultDto {
  reservations: Reservation[]
}

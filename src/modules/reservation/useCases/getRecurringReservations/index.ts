import { customerRepository, reservationRepository } from '@modules/reservation/repositories'
import GetRecurringReservationsResolver from './GetRecurringReservationsResolver'
import GetRecurringReservationsUseCase from './GetRecurringReservationsUseCase'

export const getRecurringReservationsUseCase = new GetRecurringReservationsUseCase(
  reservationRepository,
  customerRepository
)

export const getRecurringReservationsResolver = new GetRecurringReservationsResolver(getRecurringReservationsUseCase)

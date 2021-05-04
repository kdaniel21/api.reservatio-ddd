import { customerRepository, reservationRepository } from '@modules/reservation/repositories'
import { isRecurringTimeAvailableUseCase } from '../isRecurringTimeAvailable'
import CreateRecurringReservationResolver from './CreateRecurringReservationResolver'
import CreateRecurringReservationUseCase from './CreateRecurringReservationUseCase'

export const createRecurringReservationUseCase = new CreateRecurringReservationUseCase(
  isRecurringTimeAvailableUseCase,
  customerRepository,
  reservationRepository
)

export const createRecurringReservationResolver = new CreateRecurringReservationResolver(
  createRecurringReservationUseCase
)

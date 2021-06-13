import { customerRepository, reservationRepository } from '@modules/reservation/repositories'
import { areTimesAvailableUseCase } from '../areTimesAvailable'
import UpdateReservationResolver from './UpdateReservationResolver'
import UpdateReservationUseCase from './UpdateReservationUseCase'

export const updateReservationUseCase = new UpdateReservationUseCase(
  reservationRepository,
  customerRepository,
  areTimesAvailableUseCase,
)

export const updateReservationResolver = new UpdateReservationResolver(updateReservationUseCase)

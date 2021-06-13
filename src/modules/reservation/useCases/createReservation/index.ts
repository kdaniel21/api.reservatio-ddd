import { customerRepository, reservationRepository } from '@modules/reservation/repositories'
import { areTimesAvailableUseCase } from '../areTimesAvailable'
import CreateReservationResolver from './CreateReservationResolver'
import CreateReservationUseCase from './CreateReservationUseCase'

export const createReservationUseCase = new CreateReservationUseCase(
  areTimesAvailableUseCase,
  reservationRepository,
  customerRepository,
)

export const createReservationResolver = new CreateReservationResolver(createReservationUseCase)

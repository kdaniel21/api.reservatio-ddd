import { customerRepository, reservationRepository } from '@modules/reservation/repositories'
import { isTimeAvailableUseCase } from '../isTimeAvailable'
import CreateReservationResolver from './CreateReservationResolver'
import CreateReservationUseCase from './CreateReservationUseCase'

export const createReservationUseCase = new CreateReservationUseCase(
  isTimeAvailableUseCase,
  reservationRepository,
  customerRepository
)

export const createReservationResolver = new CreateReservationResolver(createReservationUseCase)

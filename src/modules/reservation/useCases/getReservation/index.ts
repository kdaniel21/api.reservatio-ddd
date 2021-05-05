import { customerRepository, reservationRepository } from '@modules/reservation/repositories'
import GetReservationResolver from './GetReservationResolver'
import GetReservationUseCase from './GetReservationUseCase'

export const getReservationUseCase = new GetReservationUseCase(reservationRepository, customerRepository)

export const getReservationResolver = new GetReservationResolver(getReservationUseCase)

import { customerRepository, reservationRepository } from '@modules/reservation/repositories'
import GetReservationsResolver from './GetReservationsResolver'
import GetReservationsUseCase from './GetReservationsUseCase'

export const getReservationsUseCase = new GetReservationsUseCase(reservationRepository, customerRepository)

export const getReservationsResolver = new GetReservationsResolver(getReservationsUseCase)

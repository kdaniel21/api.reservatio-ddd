import { reservationRepository } from '@modules/reservation/repositories'
import IsTimeAvailableResolver from './IsTimeAvailableResolver'
import IsTimeAvailableUseCase from './IsTimeAvailableUseCase'

export const isTimeAvailableUseCase = new IsTimeAvailableUseCase(reservationRepository)

export const isTimeAvailableResolver = new IsTimeAvailableResolver(isTimeAvailableUseCase)

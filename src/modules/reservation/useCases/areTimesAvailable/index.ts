import { reservationRepository } from '@modules/reservation/repositories'
import AreTimesAvailableResolver from './AreTimesAvailableResolver'
import AreTimesAvailableUseCase from './AreTimesAvailableUseCase'

export const areTimesAvailableUseCase = new AreTimesAvailableUseCase(reservationRepository)

export const areTimesAvailableResolver = new AreTimesAvailableResolver(areTimesAvailableUseCase)

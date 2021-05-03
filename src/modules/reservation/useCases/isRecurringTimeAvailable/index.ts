import { reservationRepository } from '@modules/reservation/repositories'
import IsRecurringTimeAvailableResolver from './IsRecurringTimeAvailableResolver'
import IsRecurringTimeAvailableUseCase from './IsRecurringTimeAvailableUseCase'

export const isRecurringTimeAvailableUseCase = new IsRecurringTimeAvailableUseCase(reservationRepository)

export const isRecurringTimeAvailableResolver = new IsRecurringTimeAvailableResolver(isRecurringTimeAvailableUseCase)

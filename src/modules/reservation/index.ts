import Container from 'typedi'
import './subscribers'

import IsTimeAvailableResolver from './useCases/isTimeAvailable/IsTimeAvailableResolver'
import { isTimeAvailableResolver } from './useCases/isTimeAvailable'

import CreateReservationResolver from './useCases/createReservation/CreateReservationResolver'
import { createReservationResolver } from './useCases/createReservation'

import CustomerResolver from './infra/http/GraphQL/CustomerResolver'
import { customerResolver } from './infra/http/GraphQL'

import IsRecurringTimeAvailableResolver from './useCases/isRecurringTimeAvailable/IsRecurringTimeAvailableResolver'
import { isRecurringTimeAvailableResolver } from './useCases/isRecurringTimeAvailable'

Container.set(IsTimeAvailableResolver, isTimeAvailableResolver)
Container.set(CreateReservationResolver, createReservationResolver)
Container.set(CustomerResolver, customerResolver)
Container.set(IsRecurringTimeAvailableResolver, isRecurringTimeAvailableResolver)
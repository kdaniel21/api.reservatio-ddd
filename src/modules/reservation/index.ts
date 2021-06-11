import Container from 'typedi'
import './subscribers'

import AreTimesAvailableResolver from './useCases/areTimesAvailable/AreTimesAvailableResolver'
import { areTimesAvailableResolver } from './useCases/areTimesAvailable'

import CreateReservationResolver from './useCases/createReservation/CreateReservationResolver'
import { createReservationResolver } from './useCases/createReservation'

import CustomerResolver from './infra/http/GraphQL/CustomerResolver'
import { customerResolver } from './infra/http/GraphQL'

import IsRecurringTimeAvailableResolver from './useCases/isRecurringTimeAvailable/IsRecurringTimeAvailableResolver'
import { isRecurringTimeAvailableResolver } from './useCases/isRecurringTimeAvailable'

import CreateRecurringReservationResolver from './useCases/createRecurringReservation/CreateRecurringReservationResolver'
import { createRecurringReservationResolver } from './useCases/createRecurringReservation'

import GetReservationResolver from './useCases/getReservation/GetReservationResolver'
import { getReservationResolver } from './useCases/getReservation'

import GetReservationsResolver from './useCases/getReservations/GetReservationsResolver'
import { getReservationsResolver } from './useCases/getReservations'

import GetRecurringReservationsResolver from './useCases/getRecurringReservations/GetRecurringReservationsResolver'
import { getRecurringReservationsResolver } from './useCases/getRecurringReservations'

import UpdateReservationResolver from './useCases/updateReservation/UpdateReservationResolver'
import { updateReservationResolver } from './useCases/updateReservation'

Container.set(AreTimesAvailableResolver, areTimesAvailableResolver)
Container.set(CreateReservationResolver, createReservationResolver)
Container.set(CustomerResolver, customerResolver)
Container.set(IsRecurringTimeAvailableResolver, isRecurringTimeAvailableResolver)
Container.set(CreateRecurringReservationResolver, createRecurringReservationResolver)
Container.set(GetReservationResolver, getReservationResolver)
Container.set(GetReservationsResolver, getReservationsResolver)
Container.set(GetRecurringReservationsResolver, getRecurringReservationsResolver)
Container.set(UpdateReservationResolver, updateReservationResolver)

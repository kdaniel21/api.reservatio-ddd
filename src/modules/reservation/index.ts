import Container from 'typedi'
import './subscribers'

import IsTimeAvailableResolver from './useCases/isTimeAvailable/IsTimeAvailableResolver'
import { isTimeAvailableResolver } from './useCases/isTimeAvailable'

Container.set(IsTimeAvailableResolver, isTimeAvailableResolver)

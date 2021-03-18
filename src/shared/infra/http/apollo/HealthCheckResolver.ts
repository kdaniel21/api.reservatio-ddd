import { Query, Resolver } from 'type-graphql'
import HealthCheckResponse from './HealthCheckResponse'

@Resolver()
export default class HealthCheckResolver {
  @Query(() => HealthCheckResponse)
  status(): HealthCheckResponse {
    return {
      name: 'Reservatio API v1',
      version: '0.1.0',
      status: 'running',
      currentTime: new Date(),
    }
  }
}

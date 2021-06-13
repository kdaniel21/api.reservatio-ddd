import GraphQLReservation from '@modules/reservation/infra/http/GraphQL/GraphQLReservation'
import ReservationMapper from '@modules/reservation/mappers/ReservationMapper'
import ApolloContext from '@shared/infra/http/apollo/types/ApolloContext'
import { Args, Authorized, Ctx, Query, Resolver } from 'type-graphql'
import GetReservationsArgs from './DTOs/GetReservationsArgs'
import GetReservationsUseCase from './GetReservationsUseCase'

@Resolver()
export default class GetReservationsResolver {
  constructor(private useCase: GetReservationsUseCase) {}

  @Authorized()
  @Query(() => [GraphQLReservation])
  async reservations(
    @Args() params: GetReservationsArgs,
    @Ctx() { user }: ApolloContext,
  ): Promise<GraphQLReservation[]> {
    const result = await this.useCase.execute({ ...params, redactedUser: user })
    if (result.isFailure()) throw result.error

    const reservations = result.value.reservations
    return reservations.map(reservation => ReservationMapper.toDto(reservation))
  }
}

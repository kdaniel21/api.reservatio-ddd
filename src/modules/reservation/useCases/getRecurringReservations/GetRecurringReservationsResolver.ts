import GraphQLReservation from '@modules/reservation/infra/http/GraphQL/GraphQLReservation'
import ReservationMapper from '@modules/reservation/mappers/ReservationMapper'
import UniqueID from '@shared/domain/UniqueID'
import ApolloContext from '@shared/infra/http/apollo/types/ApolloContext'
import { Args, Authorized, Ctx, Query, Resolver } from 'type-graphql'
import GetRecurringReservationsInputDto from './DTOs/GetRecurringReservationsInputDto'
import GetRecurringReservationsUseCaseDto from './DTOs/GetRecurringReservationsUseCaseDto'
import GetRecurringReservationsUseCase from './GetRecurringReservationsUseCase'

@Resolver()
export default class GetRecurringReservationsResolver {
  constructor(private readonly useCase: GetRecurringReservationsUseCase) {}

  @Authorized()
  @Query(() => [GraphQLReservation])
  async recurringReservations(
    @Args() params: GetRecurringReservationsInputDto,
    @Ctx() { user }: ApolloContext,
  ): Promise<GraphQLReservation[]> {
    const request: GetRecurringReservationsUseCaseDto = {
      ...params,
      recurringId: new UniqueID(params.recurringId),
      redactedUser: user,
    }

    const reservationsOrError = await this.useCase.execute(request)
    if (reservationsOrError.isFailure()) throw reservationsOrError.error

    return reservationsOrError.value.reservations.map(reservation => ReservationMapper.toDto(reservation))
  }
}

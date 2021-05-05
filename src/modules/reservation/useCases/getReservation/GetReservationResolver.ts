import GraphQLReservation from '@modules/reservation/infra/http/GraphQL/GraphQLReservation'
import ReservationMapper from '@modules/reservation/mappers/ReservationMapper'
import UniqueID from '@shared/domain/UniqueID'
import ApolloContext from '@shared/infra/http/apollo/types/ApolloContext'
import { Arg, Authorized, Ctx, ID, Query, Resolver } from 'type-graphql'
import GetReservationUseCase from './GetReservationUseCase'

@Resolver()
export default class GetReservationResolver {
  constructor(private useCase: GetReservationUseCase) {}

  @Authorized()
  @Query(() => GraphQLReservation)
  async reservation(@Arg('id', () => ID) id: string, @Ctx() { user }: ApolloContext): Promise<GraphQLReservation> {
    const reservationId = new UniqueID(id)
    const result = await this.useCase.execute({ reservationId, redactedUser: user })

    if (result.isFailure()) throw result.error

    const foo = ReservationMapper.toDto(result.value.reservation)

    return foo
  }
}

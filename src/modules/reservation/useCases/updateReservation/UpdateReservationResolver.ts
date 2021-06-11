import GraphQLReservation from '@modules/reservation/infra/http/GraphQL/GraphQLReservation'
import ReservationMapper from '@modules/reservation/mappers/ReservationMapper'
import UniqueID from '@shared/domain/UniqueID'
import ApolloContext from '@shared/infra/http/apollo/types/ApolloContext'
import { Args, Authorized, Ctx, Mutation, Resolver } from 'type-graphql'
import UpdateReservationInputDto from './DTOs/UpdateReservationInputDto'
import UpdateReservationUseCaseDto from './DTOs/UpdateReservationUseCaseDto'
import UpdateReservationUseCase from './UpdateReservationUseCase'

@Resolver()
export default class UpdateReservationResolver {
  constructor(private readonly useCase: UpdateReservationUseCase) {}

  @Authorized()
  @Mutation(() => GraphQLReservation)
  async updateReservation(
    @Args() params: UpdateReservationInputDto,
    @Ctx() { user }: ApolloContext
  ): Promise<GraphQLReservation> {
    const request: UpdateReservationUseCaseDto = {
      id: new UniqueID(params.id),
      connectedUpdates: params.connectedUpdates.map(id => new UniqueID(id)),
      redactedUser: user,
      updatedProperties: params.updatedProperties,
    }

    const result = await this.useCase.execute(request)
    if (result.isFailure()) throw result.error

    const reservation = ReservationMapper.toDto(result.value.reservation)
    return reservation
  }
}

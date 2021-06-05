import GraphQLReservation from '@modules/reservation/infra/http/GraphQL/GraphQLReservation'
import ReservationMapper from '@modules/reservation/mappers/ReservationMapper'
import ApolloContext from '@shared/infra/http/apollo/types/ApolloContext'
import { Args, Authorized, Ctx, Mutation, Resolver } from 'type-graphql'
import CreateReservationUseCase from './CreateReservationUseCase'
import CreateReservationInputDto from './DTOs/CreateReservationInputDto'

@Resolver()
export default class CreateReservationResolver {
  constructor(private useCase: CreateReservationUseCase) {}

  @Authorized()
  @Mutation(() => GraphQLReservation)
  async createReservation(
    @Args() params: CreateReservationInputDto,
    @Ctx() { user }: ApolloContext
  ): Promise<GraphQLReservation> {
    const result = await this.useCase.execute({ ...params, user })
    if (result.isFailure()) throw result.error

    return ReservationMapper.toDto(result.value.reservation)
  }
}

import GraphQLReservation from '@modules/reservation/infra/http/GraphQL/GraphQLReservation'
import ReservationMapper from '@modules/reservation/mappers/ReservationMapper'
import ApolloContext from '@shared/infra/http/apollo/types/ApolloContext'
import { Arg, Args, Authorized, Ctx, Mutation, Resolver } from 'type-graphql'
import IsTimeAvailableInputDto from '../isTimeAvailable/DTOs/IsTimeAvailableInputDto'
import CreateReservationUseCase from './CreateReservationUseCase'

@Resolver(() => GraphQLReservation)
export default class CreateReservationResolver {
  constructor(private useCase: CreateReservationUseCase) {}

  @Authorized()
  @Mutation(() => GraphQLReservation)
  async createReservation(
    @Args() params: IsTimeAvailableInputDto,
    @Arg('name') name: string,
    @Ctx() { user }: ApolloContext
  ): Promise<GraphQLReservation> {
    const result = await this.useCase.execute({ name, ...params, user })
    if (result.isFailure()) throw result.error

    return ReservationMapper.toDto(result.value.reservation)
  }
}

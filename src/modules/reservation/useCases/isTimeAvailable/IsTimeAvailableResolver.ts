import { Args, Authorized, Query, Resolver } from 'type-graphql'
import IsTimeAvailableInputDto from './DTOs/IsTimeAvailableInputDto'
import IsTimeAvailableResponseDto from './DTOs/IsTimeAvailableResponseDto'
import IsTimeAvailableUseCase from './IsTimeAvailableUseCase'

@Resolver()
export default class IsTimeAvailableResolver {
  constructor(private useCase: IsTimeAvailableUseCase) {}

  @Authorized()
  @Query(() => IsTimeAvailableResponseDto)
  async isTimeAvailable(@Args() params: IsTimeAvailableInputDto): Promise<IsTimeAvailableResponseDto> {
    const result = await this.useCase.execute(params)

    if (result.isFailure()) throw result.error

    const { isTimeAvailable } = result.value
    return { isTimeAvailable }
  }
}

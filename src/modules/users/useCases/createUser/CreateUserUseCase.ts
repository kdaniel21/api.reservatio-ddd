import UseCase from '@shared/core/UseCase'
import CreateUserDto from './CreateUserDto'

export default class CreateUserUseCase implements UseCase<CreateUserDto, any> {
  async execute(request: CreateUserDto, response: any): Promise<any> {}
}

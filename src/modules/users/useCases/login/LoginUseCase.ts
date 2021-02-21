import UseCase from '@shared/core/UseCase'
import { ErrorOr } from '@shared/core/DomainError'
import UserRepository from '@modules/users/repositories/UserRepository'
import LoginDto from './LoginDto'
import LoginResponseDto from './LoginResponseDto'

export default class LoginUseCase implements UseCase<LoginDto, LoginResponseDto> {
  constructor(private userRepo: UserRepository) {}

  async execute(request: LoginDto): Promise<ErrorOr<LoginResponseDto>> {}
}
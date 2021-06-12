import { customerRepository } from '@modules/reservation/repositories'
import { invitationRepository, userRepository } from '@modules/users/repositories'
import { mailerService } from '@shared/services'
import CreateInvitationResolver from './CreateInvitationResolver'
import CreateInvitationUseCase from './CreateInvitationUseCase'

export const createInvitationUseCase = new CreateInvitationUseCase(
  customerRepository,
  invitationRepository,
  userRepository,
  mailerService
)

export const createInvitationResolver = new CreateInvitationResolver(createInvitationUseCase)

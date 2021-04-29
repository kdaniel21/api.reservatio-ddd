import { userRepository } from '@modules/users/repositories'
import { mailerService } from '@shared/services'
import SendEmailConfirmationResolver from './SendEmailConfirmationResolver'
import SendEmailConfirmationUseCase from './SendEmailConfirmationUseCase'

export const sendEmailConfirmationUseCase = new SendEmailConfirmationUseCase(userRepository, mailerService)

export const sendEmailConfirmationResolver = new SendEmailConfirmationResolver(sendEmailConfirmationUseCase)

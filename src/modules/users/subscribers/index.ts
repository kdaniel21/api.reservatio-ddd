import { sendEmailConfirmationUseCase } from '../useCases/sendEmailConfirmation'
import AfterPasswordChanged from './AfterPasswordChanged'
import AfterPasswordResetTokenCreated from './AfterPasswordResetTokenCreated'
import AfterUserCreated from './AfterUserCreated'

new AfterUserCreated(sendEmailConfirmationUseCase)

new AfterPasswordChanged()

new AfterPasswordResetTokenCreated()

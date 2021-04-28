import { mailerService } from '@shared/services'
import AfterPasswordChanged from './AfterPasswordChanged'
import AfterPasswordResetTokenCreated from './AfterPasswordResetTokenCreated'
import AfterUserCreated from './AfterUserCreated'

new AfterUserCreated(mailerService)

new AfterPasswordChanged()

new AfterPasswordResetTokenCreated()

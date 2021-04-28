import mjml2html from 'mjml'
import User from '@modules/users/domain/User'
import { BaseTemplate } from './BaseTemplate'
import config from '@config'

export interface RegisterTemplateData {
  user: User
}

export class RegisterTemplate extends BaseTemplate {
  constructor(private templateData: RegisterTemplateData) {
    super()
  }

  readonly subject = 'Welcome onboard!'
  readonly template = mjml2html(`
    <mjml>
    <mj-body>
      <mj-section background-color="#f0f0f0">
        <mj-column>
          <mj-text font-style="italic" font-size="20px" color="#626262" align="center">
            Reservatio
          </mj-text>
        </mj-column>
      </mj-section>
      
      <mj-section>
        <mj-column>
          <mj-divider border-color="#F45E43"></mj-divider>

          <mj-text font-size="20px" color="#F45E43" font-family="helvetica">
            Hello ${this.templateData.user.name.value}!
          </mj-text>

          <mj-button href="${config.frontendHost}/confirm-email/${this.templateData.user.userId}">
            Confirm
          </mj-button>
        </mj-column>
      </mj-section>
    </mj-body>
  </mjml>
  `)
}

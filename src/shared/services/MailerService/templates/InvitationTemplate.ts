import config from '@config'
import { Invitation } from '@modules/users/domain/Invitation'
import mjml2html from 'mjml-core'
import { BaseTemplate } from './BaseTemplate'

export interface InvitationTemplateData {
  invitation: Invitation
}

export class InvitationTemplate extends BaseTemplate {
  constructor(private readonly templateData: InvitationTemplateData) {
    super()
  }

  readonly subject = 'Invitation to Reservatio'
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
              Hello ${this.templateData.invitation.emailAddress.value}!
            </mj-text>

            <mj-button href="${config.frontendHost}/auth/invitation/${this.templateData.invitation.token}">
              Confirm
            </mj-button>
          </mj-column>
        </mj-section>
      </mj-body>
    </mjml>
  `)
}

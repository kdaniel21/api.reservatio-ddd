import mjml2html from 'mjml'
import User from '@modules/users/domain/User'
import { BaseTemplate } from './BaseTemplate'

export interface RegisterTemplateData {
  user: User
}

export class RegisterTemplate extends BaseTemplate {
  readonly subject = 'Welcome onboard!'
  readonly template = mjml2html(`
    <mjml>
    <mj-body>
      <mj-section>
        <mj-column>
          <mj-text>
            Hello ${this.templateData.user.name.value}!
          </mj-text>
        </mj-column>
      </mj-section>
    </mj-body>
  </mjml>
  `)

  constructor(private templateData: RegisterTemplateData) {
    super()
  }
}

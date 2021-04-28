import config from '@config'
import User from '@modules/users/domain/User'
import { PromiseErrorOr } from '@shared/core/DomainError'
import logger from '@shared/infra/Logger/logger'
import nodemailer from 'nodemailer'
import SMTPConnection from 'nodemailer/lib/smtp-connection'
import MailerService from './MailerService'
import { Template } from './templates/BaseTemplate'

export default class NodeMailerService implements MailerService {
  private transporter: nodemailer.Transporter
  private readonly configuration: SMTPConnection.Options = {
    host: config.mailer.smtpHost,
    port: config.mailer.smtpPort,
    secure: config.mailer.isSmtpSecure,
    auth: {
      user: config.mailer.smtpUser,
      pass: config.mailer.smtpPassword,
    },
  }

  private isInitialized = false
  private hasErrors = false

  async sendToUser<T>(Template: Template<T>, user: User, templateData?: T): PromiseErrorOr {
    logger.info(
      `[SERVICES] Sending ${Template.name} template to ${user.name.value} (ID: ${user.id}) to address ${user.email.value}`
    )

    return this.send(Template, user.email.value, templateData)
  }

  async sendToAddress<T>(Template: Template<T>, emailAddress: string, templateData?: T): PromiseErrorOr {
    logger.info(`[SERVICES] Sending ${Template.name} template to address ${emailAddress}.`)

    return this.send(Template, emailAddress, templateData)
  }

  private async send<T>(Template: Template<T>, emailAddress: string, templateData?: T): PromiseErrorOr {
    await this.initializeTransport()

    if (this.hasErrors) {
      logger.fatal(`[SERVICES] Fatal email service error - mail could not be sent!`)
      return
    }

    const template = new Template(templateData)

    try {
      await this.transporter.sendMail({
        to: emailAddress,
        from: config.mailer.senderEmailAddress,
        subject: template.subject,
        html: template.html,
      })

      logger.info(`[SERVICES] Email has been sent to ${emailAddress}!`)
    } catch (err) {
      logger.error(`[SERVICES] Email could not be sent to ${emailAddress}!`)
      logger.error(err)
    }
  }

  private async initializeTransport(): Promise<void> {
    if (this.isInitialized) return

    this.isInitialized = true
    logger.info('[SERVICES] Initializing Nodemailer email service...')

    this.transporter = nodemailer.createTransport(this.configuration)

    try {
      await this.transporter.verify()
      logger.info('[SERVICES] Nodemailer email service is ready!')
    } catch (err) {
      logger.error('[SERVICES] Nodemailer email service could not be verified.')
      logger.error(err)

      this.hasErrors = true
    }
  }
}

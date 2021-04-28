import config from '@config'
import User from '@modules/users/domain/User'
import { PromiseErrorOr } from '@shared/core/DomainError'
import logger from '@shared/infra/Logger/logger'
import nodemailer from 'nodemailer'
import SMTPConnection from 'nodemailer/lib/smtp-connection'
import MailerService from './MailerService'

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

  async sendToUser(templateName: any, user: User): PromiseErrorOr {
    logger.info(
      `[SERVICES] Sending ${templateName} template to ${user.name.value} (ID: ${user.id}) to address ${user.email.value}`
    )

    return this.send(templateName, user.email.value)
  }

  async sendToAddress(templateName: any, emailAddress: string): PromiseErrorOr {
    logger.info(`[SERVICES] Sending ${templateName} template to address ${emailAddress}.`)

    return this.send(templateName, emailAddress)
  }

  private async send(templateName: any, emailAddress: string): PromiseErrorOr {
    await this.initializeTransport()

    if (this.hasErrors) {
      logger.fatal(`[SERVICES] Fatal email service error - mail could not be sent!`)
      return
    }

    const template = {
      subject: 'test email',
      content: 'foobar',
    }

    try {
      await this.transporter.sendMail({
        to: emailAddress,
        from: config.mailer.senderEmailAddress,
        subject: template.subject,
        html: template.content,
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

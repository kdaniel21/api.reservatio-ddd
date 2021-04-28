export default {
  smtpHost: process.env.SMTP_HOST,
  smtpPort: +process.env.SMTP_PORT,
  isSmtpSecure: Boolean(process.env.SMTP_SECURE),
  smtpUser: process.env.SMTP_USER,
  smtpPassword: process.env.SMTP_PASSWORD,
  senderEmailAddress: process.env.SENDER_EMAIL_ADDRESS,
}

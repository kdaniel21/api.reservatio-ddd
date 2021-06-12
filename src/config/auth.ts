export default {
  bcryptSaltRounds: +process.env.BCRYPT_SALT_ROUNDS || 8,
  jwtSecretKey: process.env.JWT_SECRET_KEY || 'Th1S1SaT3stS3Cr3t!!',
  jwtExpiration: process.env.JWT_EXPIRATION || '15min',
  refreshTokenCookieName: process.env.REFRESH_TOKEN_COOKIE_NAME || 'refresh-token',
  refreshTokenExpirationHours: +process.env.REFRESH_TOKEN_EXPIRATION_HOURS || 30 * 24,
  refreshTokenLength: +process.env.REFRESH_TOKEN_LENGTH || 30,
  passwordResetTokenLength: +process.env.PASSWORD_RESET_TOKEN_LENGTH || 30,
  passwordResetTokenExpirationHours: +process.env.PASSWORD_RESET_TOKEN_EXPIRATION_HOURS || 12,
  emailConfirmationTokenLength: +process.env.EMAIL_CONFIRMATION_TOKEN_LENGTH || 20,
  invitationExpirationHours: +process.env.INVITATION_EXPIRATION_HOURS || 72,
}

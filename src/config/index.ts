import auth from './auth'
import mailer from './mailer'

const config = {
  isProduction: process.env.NODE_ENV === 'prod' || process.env.NODE_ENV === 'production',
  isTesting: process.env.NODE_ENV === 'test',
  isDevelopment: process.env.NODE_ENV === 'development',
  apolloServerPort: +process.env.PORT || 3000,
  frontendHost: process.env.FRONTEND_HOST ?? 'http://localhost:4200',
}

export default {
  ...config,
  auth,
  mailer,
}

import authConfig from './auth'

const config = {
  isProduction: process.env.NODE_ENV === 'prod' || process.env.NODE_ENV === 'production',
  isTesting: process.env.NODE_ENV === 'test',
  isDevelopment: process.env.NODE_ENV === 'development',
  apolloServerPort: process.env.PORT || 3000,
}

export default {
  ...config,
  auth: { ...authConfig },
}

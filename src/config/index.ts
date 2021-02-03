import authConfig from './auth'

const config = {
  production: process.env.NODE_ENV === 'production',
  testing: process.env.NODE_ENV === 'test',
}

export default {
  ...config,
  ...authConfig,
}

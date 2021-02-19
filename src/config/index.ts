import authConfig from './auth'
import database from './database'

const config = {
  production: process.env.NODE_ENV === 'production',
  testing: process.env.NODE_ENV === 'test',
}

export default {
  ...config,
  auth: { ...authConfig },
  database: { ...database },
}

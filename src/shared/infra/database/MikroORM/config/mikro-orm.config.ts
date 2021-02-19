import config from '@config'
import { TsMorphMetadataProvider } from '@mikro-orm/reflection'

export default {
  entities: ['./src/**/infra/database/MikroORM/entities/*.ts'],
  dbName: 'vo2jog-v3',
  type: 'postgresql',
  metadataProvider: TsMorphMetadataProvider,
  debug: !config.production,
  clientUrl: config.database.url,
}

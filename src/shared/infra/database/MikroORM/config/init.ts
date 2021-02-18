import { MikroORM } from '@mikro-orm/core'
import { TsMorphMetadataProvider } from '@mikro-orm/reflection'

export default () =>
  MikroORM.init({
    metadataProvider: TsMorphMetadataProvider,
  })

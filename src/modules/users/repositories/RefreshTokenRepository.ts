import BaseRepository from '@shared/infra/database/BaseRepository'
import UserRefreshToken from '../domain/UserRefreshToken'

export default interface RefreshTokenRepository<OrmE = any> extends BaseRepository<UserRefreshToken, OrmE> {}

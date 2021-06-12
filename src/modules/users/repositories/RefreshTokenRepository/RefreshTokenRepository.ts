import UserRefreshToken from '@modules/users/domain/UserRefreshToken'
import BaseRepository from '@shared/infra/database/BaseRepository'

export default interface RefreshTokenRepository<OrmE = any> extends BaseRepository<UserRefreshToken, OrmE> {}

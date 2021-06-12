import { Invitation } from '@modules/users/domain/Invitation'
import { PromiseErrorOr } from '@shared/core/DomainError'
import BaseRepository from '@shared/infra/database/BaseRepository'

export default interface InvitationRepository<OrmE = any> extends BaseRepository<Invitation, OrmE> {
  findByToken(invitationToken: string): PromiseErrorOr<Invitation>
}

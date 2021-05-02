import Customer from '@modules/reservation/domain/Customer'
import { PromiseErrorOr } from '@shared/core/DomainError'
import UniqueID from '@shared/domain/UniqueID'
import BaseRepository from '@shared/infra/database/BaseRepository'

export default interface CustomerRepository<OrmE = any> extends BaseRepository<Customer, OrmE> {
  findByUserId(userId: UniqueID, include?: { [field: string]: boolean }): PromiseErrorOr<Customer>
}

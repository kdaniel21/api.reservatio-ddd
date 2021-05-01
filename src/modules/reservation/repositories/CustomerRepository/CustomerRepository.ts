import Customer from '@modules/reservation/domain/Customer'
import BaseRepository from '@shared/infra/database/BaseRepository'

export default interface CustomerRepository<OrmE = any> extends BaseRepository<Customer, OrmE> {}

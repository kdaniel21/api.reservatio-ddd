import { ReservationLocationEnum } from '@modules/reservation/domain/ReservationLocation'
import { registerEnumType } from 'type-graphql'

registerEnumType(ReservationLocationEnum, { name: 'ReservationLocation' })

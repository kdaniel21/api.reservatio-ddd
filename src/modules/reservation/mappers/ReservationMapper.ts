import UserMapper from '@modules/users/mappers/UserMapper'
import { Result } from '@shared/core/Result'
import UniqueID from '@shared/domain/UniqueID'
import BaseMapper from '@shared/infra/BaseMapper'
import logger from '@shared/infra/Logger/logger'
import Reservation from '../domain/Reservation'
import { ReservationLocation } from '../domain/ReservationLocation'
import ReservationName from '../domain/ReservationName'
import ReservationTime from '../domain/ReservationTime'
import ReservationDto from '../DTOs/ReservationDto'

export default class ReservationMapper implements BaseMapper<Reservation> {
  static toDto(reservation: Reservation): ReservationDto {
    return {
      id: reservation.reservationId.toString(),
      recurringId: reservation.recurringId.toString(),
      name: reservation.name.value,
      owner: UserMapper.toDto(reservation.owner),
      startTime: reservation.time.startTime,
      endTime: reservation.time.endTime,
      isActive: reservation.isActive,
      locations: { tableTennis: reservation.locations.tableTennis, badminton: reservation.locations.badminton },
      createdAt: reservation.createdAt,
      updatedAt: reservation.updatedAt,
    }
  }

  static toDomain(raw: any) {
    const recurringId = raw.recurringId ? new UniqueID(raw.recurringId) : undefined
    const nameOrError = ReservationName.create(raw.name)
    // const ownerOrError =
    const timeOrError = ReservationTime.create(raw.startTime, raw.endTime)
    const { tableTennis, badminton } = raw
    const locationsOrError = ReservationLocation.create({ tableTennis, badminton })

    const combinedResult = Result.combine([nameOrError, timeOrError, locationsOrError])
    if (combinedResult.isFailure()) logger.error(`Error while mapping to domain: ${combinedResult.error.message}`)

    const id = raw.id ? new UniqueID(raw.id) : undefined

    const reservationOrError = Reservation.create(
      {
        recurringId,
        name: nameOrError.value,
        owner: ownerOrError.value,
        time: timeOrError.value,
        isActive: raw.isActive || true,
        locations: locationsOrError.value,
        createdAt: raw.createdAt || new Date(),
        updatedAt: raw.updatedAt || new Date(),
      },
      id
    )
    if (reservationOrError.isFailure()) logger.error(`Error while mapping to domain: ${combinedResult.error.message}`)

    return reservationOrError.value
  }

  static toObject(reservation: Reservation) {
    return ReservationMapper.toDto(reservation)
  }
}

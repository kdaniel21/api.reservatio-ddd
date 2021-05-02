import ReservationDto from './ReservationDto'

export default interface CustomerDto {
  id: string
  userId: string
  name: string
  reservations?: ReservationDto[]
}

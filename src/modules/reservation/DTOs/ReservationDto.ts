import UserDto from '@modules/users/DTOs/UserDto'
import LocationDto from './LocationDto'

export default interface ReservationDto {
  id: string
  recurringId: string
  name: string
  owner: UserDto
  startTime: Date
  endTime: Date
  isActive: boolean
  locations: LocationDto
  createdAt: Date
  updatedAt: Date
}

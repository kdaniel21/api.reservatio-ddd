import CustomerDto from './CustomerDto'
import LocationDto from './LocationDto'

export default interface ReservationDto {
  id: string
  recurringId: string
  name: string
  customer: CustomerDto
  startTime: Date
  endTime: Date
  isActive: boolean
  locations: LocationDto
  createdAt: Date
  updatedAt: Date
}

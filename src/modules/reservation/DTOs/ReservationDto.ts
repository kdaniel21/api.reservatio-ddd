import CustomerDto from './CustomerDto'
import ReservationLocationDto from './ReservationLocationDto'

export default interface ReservationDto {
  id: string
  recurringId?: string
  name: string
  customer: CustomerDto
  startTime: Date
  endTime: Date
  isActive: boolean
  locations: ReservationLocationDto
  createdAt: Date
  updatedAt: Date
}

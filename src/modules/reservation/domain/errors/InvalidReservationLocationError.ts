import { AppError } from '@shared/core/AppError'

export default class InvalidReservationLocationError extends AppError.ValidationError {
  readonly message = 'At least one place needs to be reserved!'
}

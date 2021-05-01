import { AppError } from '@shared/core/AppError'

export default class InvalidReservationNameError extends AppError.ValidationError {
  constructor(public readonly message: string) {
    super()
  }
}

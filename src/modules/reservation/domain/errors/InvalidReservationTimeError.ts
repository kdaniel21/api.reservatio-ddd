import { AppError } from '@shared/core/AppError'

export default class InvalidReservationTimeError extends AppError.ValidationError {
  constructor(public readonly message: string) {
    super()
  }
}

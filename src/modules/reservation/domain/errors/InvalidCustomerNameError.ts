import { AppError } from '@shared/core/AppError'

export default class InvalidCustomerNameError extends AppError.ValidationError {
  constructor(public readonly message: string) {
    super()
  }
}

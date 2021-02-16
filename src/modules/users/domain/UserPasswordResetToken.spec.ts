import { AppError } from '@shared/core/AppError'
import faker from 'faker'
import UserPasswordResetToken from './UserPasswordResetToken'

describe('UserPasswordResetToken Value Object', () => {
  it('should create a new random password reset token', () => {
    const passwordResetTokenOrError = UserPasswordResetToken.create()

    expect(passwordResetTokenOrError.isSuccess()).toBe(true)
    expect(passwordResetTokenOrError.value?.token).not.toBeUndefined()
    expect(passwordResetTokenOrError.value?.expiresAt).not.toBeUndefined()
    expect(passwordResetTokenOrError.value?.isExpired).toBe(false)
  })

  it('should create a UserPasswordResetToken from existing data', () => {
    const existingToken = {
      token: faker.random.alpha({ count: UserPasswordResetToken.tokenOptions.TOKEN_LENGTH }),
      expiresAt: faker.date.future(),
    }

    const passwordResetTokenOrError = UserPasswordResetToken.create(existingToken)

    expect(passwordResetTokenOrError.isSuccess()).toBe(true)
    expect(passwordResetTokenOrError.isFailure()).toBe(false)
    expect(passwordResetTokenOrError.value?.isExpired).toBe(false)
    expect(passwordResetTokenOrError.value?.isTokenValid(existingToken.token)).toBe(true)
  })

  it('should create an expired UserPasswordResetToken from existing data', () => {
    const existingToken = {
      token: faker.random.alpha({ count: UserPasswordResetToken.tokenOptions.TOKEN_LENGTH }),
      expiresAt: faker.date.past(),
    }

    const passwordResetTokenOrError = UserPasswordResetToken.create(existingToken)

    expect(passwordResetTokenOrError.isSuccess()).toBe(true)
    expect(passwordResetTokenOrError.isFailure()).toBe(false)
    expect(passwordResetTokenOrError.value?.isExpired).toBe(true)
    expect(passwordResetTokenOrError.value?.isTokenValid(existingToken.token)).toBe(false)
  })

  it('should fail when using a token that is less than the minimum length', () => {
    const existingToken = {
      token: faker.random.alpha({
        count: UserPasswordResetToken.tokenOptions.TOKEN_LENGTH - 2,
      }),
      expiresAt: faker.date.future(),
    }

    const passwordResetTokenOrError = UserPasswordResetToken.create(existingToken)

    expect(passwordResetTokenOrError.isSuccess()).toBe(false)
    expect(passwordResetTokenOrError.isFailure()).toBe(true)
    expect(passwordResetTokenOrError.error).toBeInstanceOf(AppError.InputShortError)
  })
})

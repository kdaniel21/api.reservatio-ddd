import { AppError } from '@shared/core/AppError'
import faker from 'faker'
import UserRefreshToken from './UserRefreshToken'

describe('UserRefreshToken Value Object', () => {
  it('should create a new random password reset token', () => {
    const passwordResetTokenOrError = UserRefreshToken.create()

    expect(passwordResetTokenOrError.isSuccess()).toBe(true)
    expect(passwordResetTokenOrError.value?.token).not.toBeUndefined()
    expect(passwordResetTokenOrError.value?.expiresAt).not.toBeUndefined()
    expect(passwordResetTokenOrError.value?.isExpired).toBe(false)
  })

  it('should create a UserRefreshToken from existing data', () => {
    const existingToken = {
      token: faker.random.alpha({ count: UserRefreshToken.tokenOptions.TOKEN_LENGTH }),
      expiresAt: faker.date.future(),
    }

    const passwordResetTokenOrError = UserRefreshToken.create(existingToken)

    expect(passwordResetTokenOrError.isSuccess()).toBe(true)
    expect(passwordResetTokenOrError.isFailure()).toBe(false)
    expect(passwordResetTokenOrError.value?.isExpired).toBe(false)
    expect(passwordResetTokenOrError.value?.isCodeValid(existingToken.token)).toBe(true)
  })

  it('should create an expired UserRefreshToken from existing data', () => {
    const existingToken = {
      token: faker.random.alpha({ count: UserRefreshToken.tokenOptions.TOKEN_LENGTH }),
      expiresAt: faker.date.past(),
    }

    const passwordResetTokenOrError = UserRefreshToken.create(existingToken)

    expect(passwordResetTokenOrError.isSuccess()).toBe(true)
    expect(passwordResetTokenOrError.isFailure()).toBe(false)
    expect(passwordResetTokenOrError.value?.isExpired).toBe(true)
    expect(passwordResetTokenOrError.value?.isCodeValid(existingToken.token)).toBe(false)
  })

  it('should fail when using a token that is less than the minimum length', () => {
    const existingToken = {
      token: faker.random.alpha({
        count: UserRefreshToken.tokenOptions.TOKEN_LENGTH - 2,
      }),
      expiresAt: faker.date.future(),
    }

    const passwordResetTokenOrError = UserRefreshToken.create(existingToken)

    expect(passwordResetTokenOrError.isSuccess()).toBe(false)
    expect(passwordResetTokenOrError.isFailure()).toBe(true)
    expect(passwordResetTokenOrError.error).toBeInstanceOf(AppError.InputShortError)
  })
})

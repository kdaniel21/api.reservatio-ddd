import { AppError } from '@shared/core/AppError'
import UniqueID from '@shared/domain/UniqueID'
import TextUtils from '@shared/utils/TextUtils'
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
    const id = new UniqueID()
    const plainTextToken = faker.random.alpha({
      count: UserPasswordResetToken.tokenOptions.tokenLength,
    })
    const existingToken = {
      token: TextUtils.hashText(plainTextToken),
      expiresAt: faker.date.future(),
    }

    const passwordResetTokenOrError = UserPasswordResetToken.create(existingToken, id)

    expect(passwordResetTokenOrError.isSuccess()).toBe(true)
    expect(passwordResetTokenOrError.isFailure()).toBe(false)
    expect(passwordResetTokenOrError.value?.isExpired).toBe(false)
    expect(passwordResetTokenOrError.value?.isTokenValid(plainTextToken)).toBe(true)
  })

  it('should create an expired UserPasswordResetToken from existing data', () => {
    const id = new UniqueID()
    const plainTextToken = faker.random.alpha({
      count: UserPasswordResetToken.tokenOptions.tokenLength,
    })
    const existingToken = {
      token: TextUtils.hashText(plainTextToken),
      expiresAt: faker.date.past(),
    }

    const passwordResetTokenOrError = UserPasswordResetToken.create(existingToken, id)

    expect(passwordResetTokenOrError.isSuccess()).toBe(true)
    expect(passwordResetTokenOrError.isFailure()).toBe(false)
    expect(passwordResetTokenOrError.value?.isExpired).toBe(true)
    expect(passwordResetTokenOrError.value?.isTokenValid(plainTextToken)).toBe(false)
  })
})

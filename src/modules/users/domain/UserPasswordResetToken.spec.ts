import faker from 'faker'
import UserPasswordResetToken from './UserPasswordResetToken'

describe('UserPasswordResetToken Value Object', () => {
  it('should create a new random password reset token', () => {
    const passwordResetTokenOrError = UserPasswordResetToken.create()

    expect(passwordResetTokenOrError.isSuccess()).toBe(true)
  })

  it('should create a UserPasswordResetToken from existing data', () => {
    const existingToken = {
      token: faker.random.alpha({ count: UserPasswordResetToken.tokenOptions.TOKEN_LENGTH }),
      expiresAt: faker.date.future(),
    }

    const passwordResetTokenOrError = UserPasswordResetToken.create(existingToken)
    
    expect(passwordResetTokenOrError.isSuccess()).toBe(true)
    expect(passwordResetTokenOrError.isFailure()).toBe(false)
    const passwordResetToken = passwordResetTokenOrError.value as UserPasswordResetToken
    expect(passwordResetToken.isExpired).toBe(false)
  })
})

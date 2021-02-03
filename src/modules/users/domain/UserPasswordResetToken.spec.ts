import UserPasswordResetToken from './UserPasswordResetToken'

describe('UserPasswordResetToken Value Object', () => {
  it('should create a new random password reset token', () => {
    const passwordResetTokenOrError = UserPasswordResetToken.create()

    expect(passwordResetTokenOrError.isSuccess()).toBe(true)
  })
})
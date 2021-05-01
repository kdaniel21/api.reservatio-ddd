import faker from 'faker'
import User from './User'
import UserEmail from './UserEmail'
import UserName from './UserName'
import UserPassword from './UserPassword'
import UserPasswordResetToken from './UserPasswordResetToken'
import UserRefreshToken from './UserRefreshToken'

describe('User Aggregate Root', () => {
  it('should create a regular User from an existing object', async () => {
    const password = 'Th1sIsAG00dPassw0rd'
    const userEmailOrError = UserEmail.create(faker.internet.email())
    const userNameOrError = UserName.create(faker.name.findName())
    const userPasswordOrError = UserPassword.create({ password })
    const userProps = {
      email: userEmailOrError.value as UserEmail,
      name: userNameOrError.value as UserName,
      password: userPasswordOrError.value as UserPassword,
    }

    const userOrError = User.create(userProps)
    const user = userOrError.value

    expect(userOrError.isSuccess()).toBe(true)
    expect(userOrError.isFailure()).toBe(false)
    expect(user?.userId).toBeDefined()
    expect(user?.email).toBe(userEmailOrError.value)
    expect(user?.name).toBe(userNameOrError.value)
    expect(user?.password.value).toBe(userPasswordOrError.value?.value)
    expect(await user?.password.comparePassword(password)).toBe(true)
    expect(user?.isDeleted).toBe(false)
    expect(user?.isEmailConfirmed).toBe(false)
  })

  it('should create an admin User from an existing object', () => {
    const password = 'Th1sIsAG00dPassw0rd'
    const userEmailOrError = UserEmail.create(faker.internet.email())
    const userNameOrError = UserName.create(faker.name.findName())
    const userPasswordOrError = UserPassword.create({ password })
    const userProps = {
      email: userEmailOrError.value as UserEmail,
      name: userNameOrError.value as UserName,
      password: userPasswordOrError.value as UserPassword,
    }

    const userOrError = User.create(userProps)
    const user = userOrError.value

    expect(userOrError.isSuccess()).toBe(true)
    expect(userOrError.isFailure()).toBe(false)
    expect(user?.userId).toBeDefined()
    expect(user?.email).toBe(userEmailOrError.value)
    expect(user?.name).toBe(userNameOrError.value)
    expect(user?.password.value).toBe(userPasswordOrError.value?.value)
    expect(user?.isDeleted).toBe(false)
    expect(user?.isEmailConfirmed).toBe(false)
  })

  it('should create a deleted User from an existing object', () => {
    const password = 'Th1sIsAG00dPassw0rd'
    const userEmailOrError = UserEmail.create(faker.internet.email())
    const userNameOrError = UserName.create(faker.name.findName())
    const userPasswordOrError = UserPassword.create({ password })
    const userProps = {
      email: userEmailOrError.value as UserEmail,
      name: userNameOrError.value as UserName,
      password: userPasswordOrError.value as UserPassword,
      isDeleted: true,
    }

    const userOrError = User.create(userProps)
    const user = userOrError.value

    expect(userOrError.isSuccess()).toBe(true)
    expect(userOrError.isFailure()).toBe(false)
    expect(user?.userId).toBeDefined()
    expect(user?.email).toBe(userEmailOrError.value)
    expect(user?.name).toBe(userNameOrError.value)
    expect(user?.password.value).toBe(userPasswordOrError.value?.value)
    expect(user?.isDeleted).toBe(true)
    expect(user?.isEmailConfirmed).toBe(false)
  })

  it('should create a regular User from an existing object with refresh tokens', async () => {
    const password = 'Th1sIsAG00dPassw0rd'
    const userEmailOrError = UserEmail.create(faker.internet.email())
    const userNameOrError = UserName.create(faker.name.findName())
    const userPasswordOrError = UserPassword.create({ password })
    const refreshToken = UserRefreshToken.create()
    const userProps = {
      email: userEmailOrError.value as UserEmail,
      name: userNameOrError.value as UserName,
      password: userPasswordOrError.value as UserPassword,
      refreshTokens: [refreshToken.value as UserRefreshToken],
    }

    const userOrError = User.create(userProps)
    const user = userOrError.value

    expect(userOrError.isSuccess()).toBe(true)
    expect(userOrError.isFailure()).toBe(false)
    expect(user?.email).toBe(userEmailOrError.value)
    expect(user?.name).toBe(userNameOrError.value)
    expect(user?.password.value).toBe(userPasswordOrError.value?.value)
    expect(await user?.password.comparePassword(password)).toBe(true)
    expect(user?.isDeleted).toBe(false)
    expect(user?.isEmailConfirmed).toBe(false)
    expect(user?.isRefreshTokenValid(refreshToken.value?.token as string)).toBe(true)
    const invalidToken = faker.random.alphaNumeric(20)
    expect(user?.isRefreshTokenValid(invalidToken)).toBe(false)
  })

  it('should create a regular User from an existing object with password reset token', async () => {
    const password = 'Th1sIsAG00dPassw0rd'
    const userEmailOrError = UserEmail.create(faker.internet.email())
    const userNameOrError = UserName.create(faker.name.findName())
    const userPasswordOrError = UserPassword.create({ password })
    const passwordResetTokenOrError = UserPasswordResetToken.create()
    const userProps = {
      email: userEmailOrError.value as UserEmail,
      name: userNameOrError.value as UserName,
      password: userPasswordOrError.value as UserPassword,
      passwordResetToken: passwordResetTokenOrError.value as UserPasswordResetToken,
    }

    const userOrError = User.create(userProps)
    const user = userOrError.value

    expect(userOrError.isSuccess()).toBe(true)
    expect(userOrError.isFailure()).toBe(false)
    expect(user?.email).toBe(userEmailOrError.value)
    expect(user?.name).toBe(userNameOrError.value)
    expect(user?.password.value).toBe(userPasswordOrError.value?.value)
    expect(await user?.password.comparePassword(password)).toBe(true)
    expect(user?.isDeleted).toBe(false)
    expect(user?.isEmailConfirmed).toBe(false)
    expect(user?.passwordResetToken?.isTokenValid(passwordResetTokenOrError.value?.token as string)).toBe(true)
    const invalidToken = faker.random.alphaNumeric(20)
    expect(user?.passwordResetToken?.isTokenValid(invalidToken)).toBe(false)
  })
})

import { AppError } from '@shared/core/AppError'
import faker from 'faker'
import UserRefreshToken from './UserRefreshToken'

describe('UserRefreshToken Value Object', () => {
  it('should create a new random refresh token', () => {
    const refreshTokenOrError = UserRefreshToken.create()

    expect(refreshTokenOrError.isSuccess()).toBe(true)
    expect(refreshTokenOrError.value?.token).not.toBeUndefined()
    expect(refreshTokenOrError.value?.expiresAt).not.toBeUndefined()
    expect(refreshTokenOrError.value?.isExpired).toBe(false)
  })

  it('should create a UserRefreshToken from existing data', () => {
    const existingToken = {
      token: faker.random.alpha({ count: UserRefreshToken.tokenOptions.TOKEN_LENGTH }),
      expiresAt: faker.date.future(),
    }

    const refreshTokenOrError = UserRefreshToken.create(existingToken)

    expect(refreshTokenOrError.isSuccess()).toBe(true)
    expect(refreshTokenOrError.isFailure()).toBe(false)
    expect(refreshTokenOrError.value?.isExpired).toBe(false)
    expect(refreshTokenOrError.value?.isTokenValid(existingToken.token)).toBe(true)
  })

  it('should create an expired UserRefreshToken from existing data', () => {
    const existingToken = {
      token: faker.random.alpha({ count: UserRefreshToken.tokenOptions.TOKEN_LENGTH }),
      expiresAt: faker.date.past(),
    }

    const refreshTokenOrError = UserRefreshToken.create(existingToken)

    expect(refreshTokenOrError.isSuccess()).toBe(true)
    expect(refreshTokenOrError.isFailure()).toBe(false)
    expect(refreshTokenOrError.value?.isExpired).toBe(true)
    expect(refreshTokenOrError.value?.isTokenValid(existingToken.token)).toBe(false)
  })

  it('should fail when using a token that is less than the minimum length', () => {
    const existingToken = {
      token: faker.random.alpha({
        count: UserRefreshToken.tokenOptions.TOKEN_LENGTH - 2,
      }),
      expiresAt: faker.date.future(),
    }

    const refreshTokenOrError = UserRefreshToken.create(existingToken)

    expect(refreshTokenOrError.isSuccess()).toBe(false)
    expect(refreshTokenOrError.isFailure()).toBe(true)
    expect(refreshTokenOrError.error).toBeInstanceOf(AppError.InputShortError)
  })
})
